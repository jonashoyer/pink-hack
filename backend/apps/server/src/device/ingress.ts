import type { Server as NodeHTTPServer, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { Database } from "@backend/db";
import { WebSocketServer, WebSocket } from "ws";
import type { RawData } from "ws";
import { getJournalEntry } from "../domain/journal";
import { DomainError } from "../domain/errors";
import { authenticateDevice, registerDeviceRevocation } from "./credentials";
import { DEVICE_AUDIO_PATH, MAX_AUDIO_QUEUE_BYTES, MAX_PCM_CHUNK_BYTES, PCM_BYTES_PER_SECOND, deviceControlSchema } from "./contracts";
import type { DeviceAudioConfig, DeviceConversation, DeviceControl, DeviceState, DeviceTranscript } from "./contracts";
import { PcmQueue } from "./audio-queue";
import { DeviceLiveSession, rawBuffer } from "./live";
import type { LiveEvent, ProviderSocketFactory } from "./live";
import { claimDeviceLease, DeviceLeaseGuard, releaseDeviceLease } from "./lease";
import type { DeviceLease } from "./lease";

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new DomainError(409, "device_operation_canceled", "The device operation was canceled."));
    if (signal.aborted) { promise.catch(() => {}); abort(); return; }
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}
// Bound each Live append conservatively below 500 tokens, preserving Unicode.
function speakableChunks(text: string): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const char of text) {
    if (Buffer.byteLength(current + char) > 500) { chunks.push(current); current = ""; }
    current += char;
  }
  if (current) chunks.push(current);
  return chunks;
}

export class DeviceAudioConnection {
  private conversation?: DeviceConversation;
  private live?: DeviceLiveSession;
  private generation = 0;
  private state: DeviceState = "stopped";
  private closing = false;
  private work = new AbortController();
  private transcripts: DeviceTranscript[] = [];
  private transcriptBytes = 0;
  private delegationIds = new Set<string>();
  private emittedEntries = new Set<string>();
  private activeDelegations = 0;
  private controls: Promise<void> = Promise.resolve();
  private queuedControls = 0;
  private input: PcmQueue;
  private output: PcmQueue;
  private lease: DeviceLeaseGuard;
  constructor(private readonly socket: WebSocket, private readonly db: Database,
    private readonly ownerId: string, private readonly deviceId: string, private readonly config: DeviceAudioConfig,
    lease: DeviceLease, private readonly factory?: ProviderSocketFactory) {
    this.lease = new DeviceLeaseGuard(db, lease, () => this.fatal("device_lease_lost"));
    this.input = new PcmQueue((audio) => { if (this.usable()) this.live!.append(audio); }, () => this.fatal("audio_backpressure"));
    this.output = new PcmQueue((audio) => {
      if (!this.usable()) return;
      if (socket.readyState !== WebSocket.OPEN || socket.bufferedAmount + audio.length > MAX_AUDIO_QUEUE_BYTES) throw new Error("Device playback buffer limit exceeded.");
      socket.send(audio, { binary: true }, (error) => { if (error) this.fatal("audio_transport_failed"); });
    }, () => this.fatal("audio_backpressure"));
    socket.on("message", (data, binary) => this.receive(data, binary));
    socket.on("close", () => { void this.disconnect(); });
    socket.on("error", () => { void this.disconnect(); });
    this.publish("stopped");
  }
  revoke() { this.fatal("device_credential_rotated"); }
  async disconnect() {
    if (this.closing) return;
    this.closing = true;
    this.work.abort(); this.input.dispose(); this.output.dispose();
    // Stop, cancel and network loss retain conversation and committed writes.
    // Cancellation is transport cancellation, not journal rollback.
    await Promise.all([this.lease.close(), this.live?.close()]);
  }
  private usable() { return !this.closing && this.lease.valid(); }
  private receive(data: RawData, binary: boolean) {
    if (!this.usable()) return;
    const bytes = rawBuffer(data);
    if (binary) {
      if (!this.live || !this.conversation || this.state === "connecting" || this.state === "stopped") { this.error("device_not_listening"); return; }
      if (!bytes.length || bytes.length % 2 || bytes.length > MAX_PCM_CHUNK_BYTES) { this.fatal("invalid_pcm_chunk"); return; }
      try { this.input.enqueue(bytes); this.publish("listening"); } catch { this.fatal("audio_backpressure"); }
      return;
    }
    if (bytes.length > 4096) { this.fatal("invalid_device_control"); return; }
    let raw: unknown;
    try { raw = JSON.parse(bytes.toString("utf8")); } catch { this.error("invalid_device_control"); return; }
    if (raw && typeof raw === "object" && (raw as { type?: unknown }).type === "confirm") { this.error("device_control_not_supported"); return; }
    const parsed = deviceControlSchema.safeParse(raw);
    if (!parsed.success) { this.error("invalid_device_control"); return; }
    const control = parsed.data;
    if (["interrupt", "stop", "cancel"].includes(control.type)) { this.work.abort(); this.flush(); void this.live?.close(); }
    if (++this.queuedControls > 16) { this.fatal("device_control_backpressure"); return; }
    this.controls = this.controls.then(async () => {
      if (this.usable()) await this.control(control);
    }).catch((error: unknown) => {
      if (this.usable()) { this.error(error instanceof DomainError ? error.code : "device_operation_failed"); this.publish("error"); }
    }).finally(() => { this.queuedControls--; });
  }
  private owned(conversation: DeviceConversation) {
    if (conversation.source !== "atech" || conversation.device_id !== this.deviceId) throw new DomainError(403, "device_conversation_mismatch", "The voice conversation is not bound to this device.");
    return conversation;
  }
  private async control(control: DeviceControl) {
    if (control.type === "start") {
      if (this.live || this.conversation) throw new DomainError(409, "device_session_active", "This device already has a voice conversation.");
      if (control.voice_session_id && control.entry_id) throw new DomainError(422, "invalid_device_control", "Resume keeps the existing conversation target.");
      this.publish("connecting");
      const app = this.config.application;
      const conversation = this.owned(control.voice_session_id
        ? await app.readConversation(this.db, this.ownerId, this.deviceId, control.voice_session_id)
        : await app.startConversation(this.db, this.ownerId, this.deviceId, control.operation_id, control.entry_id));
      if (!this.usable()) return;
      // Stopped conversations remain resumable. Hooks enforce DB ownership.
      this.conversation = conversation;
      await this.startLive(); return;
    }
    if (control.type === "stop" || control.type === "cancel") {
      this.work.abort();
      const finalized = await this.live?.close();
      if (finalized === false) this.error("device_voice_close_unverified");
      this.publish("stopped");
      await this.disconnect(); this.socket.close(1000, control.type); return;
    }
    if (!this.conversation) throw new DomainError(409, "device_conversation_required", "Start a voice conversation first.");
    if (control.type === "interrupt") {
      this.publish("connecting");
      // Live has no documented output-cancel. Close the old session and
      // suppress its deltas while retaining the application conversation ID.
      await this.live?.close(); this.live = undefined;
      await this.startLive(); return;
    }
    if (control.type === "audio_turn_end") {
      if (!this.live) throw new DomainError(409, "device_not_listening", "The Live session is not ready.");
      // Live has no documented PTT commit. Paced silence permits automatic
      // endpointing. There is no transcript confirmation gate in this path.
      this.input.enqueue(Buffer.alloc(PCM_BYTES_PER_SECOND)); this.publish("thinking");
    }
  }
  private async startLive() {
    const generation = this.generation;
    this.work = new AbortController();
    const session = new DeviceLiveSession(this.config, (event) => {
      if (generation === this.generation && this.usable()) this.liveEvent(event, generation);
    }, () => { if (generation === this.generation) this.fatal("device_voice_failed"); }, this.factory);
    this.live = session;
    await session.start();
    if (generation !== this.generation || !this.usable()) { await session.close(); return; }
    // The application reloads persisted context; retain a bounded voice hint.
    const recent = this.transcripts.slice(-4).map((part) => `${part.role}: ${part.text}`).join("\n");
    for (const content of speakableChunks(recent).slice(-3)) session.send({ type: "session.thinking.append", delegation_id: null, content });
    this.publish("listening");
  }
  private liveEvent(event: LiveEvent, generation: number) {
    try {
      if (event.type === "session.output_audio.delta") {
        if (typeof event.delta !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(event.delta)) throw new Error("Invalid output PCM.");
        this.output.enqueue(Buffer.from(event.delta, "base64")); this.publish("speaking");
      } else if (event.type === "session.input_transcript.delta" || event.type === "session.output_transcript.delta") {
        if (typeof event.delta !== "string" || typeof event.start_ms !== "number" || typeof event.end_ms !== "number"
          || !Number.isFinite(event.start_ms) || !Number.isFinite(event.end_ms) || event.start_ms < 0 || event.end_ms < event.start_ms) throw new Error("Invalid transcript.");
        this.transcriptBytes += Buffer.byteLength(event.delta);
        if (this.transcriptBytes > 65536 || this.transcripts.length >= 2048) throw new Error("Transcript limit exceeded.");
        this.transcripts.push({ role: event.type === "session.input_transcript.delta" ? "user" : "assistant", text: event.delta, startMs: event.start_ms, endMs: event.end_ms });
      } else if (event.type === "session.delegation.created") {
        const delegation = event.delegation as { id?: unknown; target?: unknown } | undefined;
        if (!delegation || typeof delegation.id !== "string" || !delegation.id.length || delegation.id.length > 512 || delegation.target !== "client") throw new Error("Invalid delegation.");
        if (this.delegationIds.has(delegation.id)) return;
        if (this.delegationIds.size >= 128 || this.activeDelegations >= 4) throw new Error("Delegation limit exceeded.");
        this.delegationIds.add(delegation.id); void this.delegate(delegation.id, generation);
      }
    } catch { this.fatal("device_provider_protocol_failed"); }
  }
  private async delegate(delegationId: string, generation: number) {
    if (!this.conversation || !this.usable()) return;
    const signal = this.work.signal;
    const voiceSessionId = this.conversation.id;
    this.activeDelegations++; this.publish("thinking");
    try {
      const result = await abortable(this.config.application.onDelegation({ ownerId: this.ownerId, deviceId: this.deviceId, voiceSessionId,
        delegationId, transcripts: this.transcripts.map((part) => ({ ...part })), signal }), signal);
      if (signal.aborted || generation !== this.generation || !this.usable()) return;
      if (!result || !Array.isArray(result.entries) || result.entries.length > 32) throw new DomainError(502, "device_save_unverified", "The application returned invalid saved-entry metadata.");
      // Verify every advertised write before any saved event or spoken response.
      const verified: Array<{ id: string; revision: number }> = [];
      for (const saved of result.entries) {
        if (!saved || typeof saved.id !== "string" || !Number.isInteger(saved.revision) || saved.revision < 1) throw new DomainError(502, "device_save_unverified", "Saved-entry metadata is invalid.");
        const entry = await getJournalEntry(this.db, this.ownerId, saved.id);
        if (entry.revision !== saved.revision) throw new DomainError(409, "device_save_revision_changed", "The saved journal revision changed before verification.");
        verified.push({ id: entry.id, revision: entry.revision });
      }
      this.conversation = this.owned(await this.config.application.readConversation(this.db, this.ownerId, this.deviceId, voiceSessionId));
      if (signal.aborted || generation !== this.generation || !this.usable()) return;
      if (result.text !== undefined && (typeof result.text !== "string" || Buffer.byteLength(result.text) > 12000)) throw new Error("Delegation text exceeds its limit.");
      for (const saved of verified) {
        const key = `${saved.id}:${saved.revision}`;
        if (!this.emittedEntries.has(key)) {
          if (this.emittedEntries.size >= 1024) throw new Error("Saved event limit exceeded.");
          this.emittedEntries.add(key);
          this.json({ type: "saved", entry_id: saved.id, revision: saved.revision, voice_session_id: voiceSessionId });
        }
      }
      for (const content of speakableChunks(result.text ?? "")) this.live!.send({ type: "session.commentary.append", delegation_id: delegationId, content });
      this.publish("listening");
    } catch (error) {
      if (!signal.aborted && generation === this.generation && this.usable()) { this.error(error instanceof DomainError ? error.code : "device_delegation_failed"); this.publish("error"); }
    } finally { this.activeDelegations--; }
  }
  private flush() {
    this.generation++; this.input.flush(); this.output.flush();
    this.json({ type: "flush", generation: this.generation });
  }
  private publish(state: DeviceState) {
    const changed = state !== this.state;
    this.state = state;
    if (changed || state === "stopped") this.json({ type: "state", state, voice_session_id: this.conversation?.id ?? null, last_entry_id: this.conversation?.last_entry_id ?? null });
  }
  private error(code: string) { this.json({ type: "error", code }); }
  private fatal(code: string) {
    if (this.closing) return;
    this.error(code); this.publish("error"); this.flush();
    void this.disconnect(); this.socket.close(1011, "device_session_failed");
  }
  private json(value: Record<string, unknown>) {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    // Leave bounded room for an ordered flush barrier under PCM backpressure.
    if (this.socket.bufferedAmount > MAX_AUDIO_QUEUE_BYTES * 2) { this.socket.terminate(); void this.disconnect(); return; }
    this.socket.send(JSON.stringify(value), (error) => { if (error) void this.disconnect(); });
  }
}

export function attachDeviceAudio(server: NodeHTTPServer, db: Database, config: DeviceAudioConfig,
  dependencies: { providerSocketFactory?: ProviderSocketFactory } = {}) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 4096, perMessageDeflate: false });
  let active: DeviceAudioConnection | undefined;
  let reserved = false;
  let detached = false;
  const unregister = registerDeviceRevocation(db, () => active?.revoke());
  const reject = (socket: Duplex, status: number) => {
    const reason = status === 401 ? "Unauthorized" : status === 409 ? "Conflict" : status === 400 ? "Bad Request" : "Service Unavailable";
    if (!socket.destroyed) socket.end(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  };
  const upgrade = (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    let url: URL;
    try { url = new URL(request.url ?? "", "http://backend.invalid"); } catch { return; }
    if (url.pathname !== DEVICE_AUDIO_PATH) return;
    if (url.search || request.method !== "GET") { reject(socket, 400); return; }
    if (reserved || active || detached) { reject(socket, 409); return; }
    reserved = true;
    let lease: DeviceLease | undefined;
    let accepted = false;
    void authenticateDevice(db, request.headers.authorization).then(async (device) => {
      // The database CAS, not the process-local slot, excludes other instances.
      lease = await claimDeviceLease(db, device);
      socket.once("close", () => { if (!accepted && lease) void releaseDeviceLease(db, lease).catch(() => {}); });
      if (detached || socket.destroyed) { await releaseDeviceLease(db, lease); reject(socket, 401); return; }
      wss.handleUpgrade(request, socket, head, (ws) => {
        active = new DeviceAudioConnection(ws, db, device.owner_id, device.id, config, lease!, dependencies.providerSocketFactory);
        accepted = true;
        const connection = active;
        ws.on("close", () => { if (active === connection) active = undefined; });
      });
    }).catch(async (error: unknown) => {
      if (lease && !accepted) await releaseDeviceLease(db, lease).catch(() => {});
      reject(socket, error instanceof DomainError && [401, 409].includes(error.status) ? error.status : 503);
    }).finally(() => { reserved = false; });
  };
  server.on("upgrade", upgrade);
  return async () => {
    detached = true; server.off("upgrade", upgrade); unregister();
    active?.revoke(); await active?.disconnect(); wss.close();
  };
}
