import type { Server as NodeHTTPServer, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { randomUUID } from "node:crypto";
import type { Database } from "@backend/db";
import { WebSocketServer, WebSocket } from "ws";
import type { RawData } from "ws";
import { cancelCheckin, confirmDraft, getCheckin, getJournalEntry } from "../domain/journal";
import { DomainError } from "../domain/errors";
import { authenticateDevice, registerDeviceRevocation } from "./credentials";
import { DEVICE_AUDIO_PATH, MAX_AUDIO_QUEUE_BYTES, MAX_PCM_CHUNK_BYTES, PCM_BYTES_PER_SECOND, deviceControlSchema } from "./contracts";
import type { DeviceAudioConfig, DeviceCheckin, DeviceControl, DeviceState, DeviceTranscript } from "./contracts";
import { PcmQueue } from "./audio-queue";
import { DeviceLiveSession, rawBuffer } from "./live";
import type { LiveEvent, ProviderSocketFactory } from "./live";
import { CONFIRMATION_PHRASES, SpeechConfirmation } from "./speech-confirmation";
import type { ArmedReview } from "./speech-confirmation";

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new DomainError(409, "device_operation_canceled", "The device operation was canceled."));
    if (signal.aborted) { promise.catch(() => {}); abort(); return; }
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}

export class DeviceAudioConnection {
  private checkin?: DeviceCheckin;
  private live?: DeviceLiveSession;
  private generation = 0;
  private state: DeviceState = "stopped";
  private closing = false;
  private work = new AbortController();
  private transcripts: DeviceTranscript[] = [];
  private transcriptBytes = 0;
  private delegationIds = new Set<string>();
  private activeDelegations = 0;
  private controls: Promise<void> = Promise.resolve();
  private queuedControls = 0;
  private input: PcmQueue;
  private output: PcmQueue;
  private armedReview?: ArmedReview;
  private speech = new SpeechConfirmation((review) => {
    this.queueControl(async () => {
      if (!this.closing && !this.work.signal.aborted && this.generation === review.generation
        && this.checkin?.id === review.checkinId && this.armedReview?.revision === review.revision) {
        await this.confirm(review.revision, review.operationId, review);
      }
    });
  });
  constructor(private readonly socket: WebSocket, private readonly db: Database,
    private readonly ownerId: string, private readonly deviceId: string, private readonly config: DeviceAudioConfig,
    private readonly factory?: ProviderSocketFactory) {
    this.input = new PcmQueue((audio) => this.live!.append(audio), () => this.fatal("audio_backpressure"));
    this.output = new PcmQueue((audio) => {
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
    this.work.abort(); this.speech.clear(); this.input.dispose(); this.output.dispose();
    // A network disconnect retains the owned draft/check-in for ID-based resume.
    await this.live?.close();
  }
  private receive(data: RawData, binary: boolean) {
    if (this.closing) return;
    const bytes = rawBuffer(data);
    if (binary) {
      if (!this.live || !this.checkin || this.state === "connecting" || this.state === "saved" || this.state === "stopped") { this.error("device_not_listening"); return; }
      if (!bytes.length || bytes.length % 2 || bytes.length > MAX_PCM_CHUNK_BYTES) { this.fatal("invalid_pcm_chunk"); return; }
      try { this.speech.captureChunk(); this.input.enqueue(bytes); this.publish("listening"); } catch { this.fatal("audio_backpressure"); }
      return;
    }
    if (bytes.length > 4096) { this.fatal("invalid_device_control"); return; }
    let raw: unknown;
    try { raw = JSON.parse(bytes.toString("utf8")); } catch { this.error("invalid_device_control"); return; }
    const parsed = deviceControlSchema.safeParse(raw);
    if (!parsed.success) { this.error("invalid_device_control"); return; }
    const control = parsed.data;
    // Stop/cancel/interrupt abort application work as soon as the frame arrives.
    if (["interrupt", "stop", "cancel"].includes(control.type)) { this.work.abort(); this.flush(); void this.live?.close(); }
    this.queueControl(() => this.control(control));
  }
  private queueControl(operation: () => Promise<void>) {
    if (++this.queuedControls > 16) { this.fatal("device_control_backpressure"); return; }
    this.controls = this.controls.then(async () => {
      if (!this.closing) await operation();
    }).catch((error: unknown) => {
      if (!this.closing) {
        this.error(error instanceof DomainError ? error.code : "device_operation_failed");
        this.publish(this.checkin?.stage === "draft" || this.checkin?.stage === "awaiting_confirmation" ? "review" : "error");
      }
    }).finally(() => { this.queuedControls--; });
  }
  private async owned(checkin: DeviceCheckin) {
    if (checkin.source !== "atech" || checkin.device_id !== this.deviceId) throw new DomainError(403, "device_checkin_mismatch", "The check-in is not bound to this device.");
    return checkin;
  }
  private async control(control: DeviceControl) {
    if (control.type === "start") {
      if (this.live || this.checkin) throw new DomainError(409, "device_session_active", "This device already has a check-in.");
      this.publish("connecting");
      const app = this.config.application;
      this.checkin = await this.owned(control.checkin_id
        ? await app.loadCheckin(this.db, this.ownerId, this.deviceId, control.checkin_id)
        : await app.startCheckin(this.db, this.ownerId, this.deviceId, control.operation_id));
      if (this.checkin.stage === "canceled" || this.checkin.stage === "saved") throw new DomainError(409, "checkin_terminal", "Start a new check-in.");
      await this.startLive();
      return;
    }
    if (!this.checkin) throw new DomainError(409, "device_checkin_required", "Start a check-in first.");
    if (control.type === "stop" || control.type === "cancel") {
      this.work.abort(); this.flush();
      this.checkin = await this.owned(await getCheckin(this.db, this.ownerId, this.checkin.id));
      if (control.type === "cancel" && this.checkin.stage !== "saved") await cancelCheckin(this.db, this.ownerId, this.checkin.id);
      const finalized = await this.live?.close();
      if (finalized === false) this.error("device_voice_close_unverified");
      this.publish("stopped"); this.closing = true;
      this.input.dispose(); this.output.dispose(); this.socket.close(1000, "stopped");
      return;
    }
    if (control.type === "interrupt") {
      this.work.abort(); this.flush(); this.publish("connecting");
      // Live has no documented output-cancel command. Closing the old session
      // suppresses all old-generation deltas and cancels provider work.
      await this.live?.close(); this.live = undefined;
      await this.startLive(); return;
    }
    if (control.type === "audio_turn_end") {
      if (!this.live) throw new DomainError(409, "device_not_listening", "The Live session is not ready.");
      // There is no documented Live PTT commit event. Preserve automatic
      // endpointing by sending one second of paced silence after captured PCM.
      this.input.enqueue(Buffer.alloc(PCM_BYTES_PER_SECOND));
      this.speech.turnEnd();
      this.publish("thinking"); return;
    }
    if (control.type === "confirm") {
      await this.confirm(control.draft_revision, control.operation_id);
    }
  }
  private async confirm(draftRevision: number, operationId: string, review?: ArmedReview) {
      if (!this.checkin) throw new DomainError(409, "device_checkin_required", "Start a check-in first.");
      const signal = this.work.signal;
      if (signal.aborted) throw new DomainError(409, "device_operation_canceled", "The current device operation was canceled.");
      this.checkin = await this.owned(await getCheckin(this.db, this.ownerId, this.checkin.id));
      if (signal.aborted || this.closing || (review && review.generation !== this.generation)) return;
      if (this.checkin.draft_revision !== draftRevision) { this.speech.clear(); this.armedReview = undefined; throw new DomainError(409, "revision_conflict", "The journal draft changed. Review it again."); }
      // Model delegation never enters this branch. The caller is a validated
      // device confirm control or the separately armed exact-input-ASR gate.
      const confirmed = await confirmDraft(this.db, this.ownerId, this.checkin.id, { draft_revision: draftRevision, operation_id: operationId, action: "save" });
      if (signal.aborted) return;
      const current = await this.owned(await getCheckin(this.db, this.ownerId, this.checkin.id));
      if (signal.aborted || this.closing || (review && review.generation !== this.generation)) return;
      if (current.draft_revision !== draftRevision || current.stage === "canceled") throw new DomainError(409, "revision_conflict", "The journal draft changed. Review it again.");
      this.publish("thinking");
      const saved = await abortable(this.config.application.onConfirmed({ ownerId: this.ownerId, deviceId: this.deviceId, checkinId: this.checkin.id,
        draftRevision, operationId, receipt: confirmed.confirmation_receipt, signal }), signal);
      if (signal.aborted || this.closing) return;
      const checkin = await this.owned(await getCheckin(this.db, this.ownerId, this.checkin.id));
      const entry = await getJournalEntry(this.db, this.ownerId, saved.entry_id);
      if (signal.aborted || this.closing || (review && review.generation !== this.generation)) return;
      if (checkin.stage !== "saved" || checkin.saved_entry_id !== entry.id || entry.revision !== saved.revision) throw new DomainError(502, "device_save_unverified", "The journal commit could not be verified.");
      this.checkin = checkin;
      this.speech.clear(); this.armedReview = undefined;
      this.publish("saved"); this.json({ type: "saved", entry_id: entry.id, revision: entry.revision });
  }
  private async startLive() {
    const generation = this.generation;
    this.work = new AbortController();
    const session = new DeviceLiveSession(this.config, (event) => {
      if (generation !== this.generation || this.closing) return;
      this.liveEvent(event, generation);
    }, () => { if (generation === this.generation) this.fatal("device_voice_failed"); }, this.factory);
    this.live = session;
    await session.start();
    if (generation !== this.generation || this.closing) { await session.close(); return; }
    if (this.transcripts.length) {
      // Quiet continuity context is not a permission source or a confirmation.
      const content = JSON.stringify(this.transcripts).slice(-1500);
      session.send({ type: "session.thinking.append", delegation_id: null, content });
    }
    this.publish(this.checkin?.stage === "draft" || this.checkin?.stage === "awaiting_confirmation" ? "review" : "listening");
  }
  private liveEvent(event: LiveEvent, generation: number) {
    try {
      if (event.type === "session.output_audio.delta") {
        if (typeof event.delta !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(event.delta)) throw new Error("Invalid output PCM.");
        const audio = Buffer.from(event.delta, "base64");
        this.output.enqueue(audio); this.publish("speaking");
      } else if (event.type === "session.input_transcript.delta" || event.type === "session.output_transcript.delta") {
        if (typeof event.delta !== "string" || typeof event.start_ms !== "number" || typeof event.end_ms !== "number"
          || !Number.isFinite(event.start_ms) || !Number.isFinite(event.end_ms) || event.start_ms < 0 || event.end_ms < event.start_ms) throw new Error("Invalid transcript.");
        this.transcriptBytes += Buffer.byteLength(event.delta);
        if (this.transcriptBytes > 65536 || this.transcripts.length >= 2048) throw new Error("Transcript limit exceeded.");
        this.transcripts.push({ role: event.type === "session.input_transcript.delta" ? "user" : "assistant", text: event.delta, startMs: event.start_ms, endMs: event.end_ms });
        if (event.type === "session.input_transcript.delta") this.speech.inputTranscript(event.delta);
      } else if (event.type === "session.delegation.created") {
        const delegation = event.delegation as { id?: unknown; target?: unknown } | undefined;
        if (!delegation || typeof delegation.id !== "string" || !delegation.id.length || delegation.id.length > 512 || delegation.target !== "client") throw new Error("Invalid delegation.");
        if (this.delegationIds.has(delegation.id)) return;
        if (this.delegationIds.size >= 128 || this.activeDelegations >= 4) throw new Error("Delegation limit exceeded.");
        this.delegationIds.add(delegation.id);
        void this.delegate(delegation.id, generation);
      }
    } catch { this.fatal("device_provider_protocol_failed"); }
  }
  private async delegate(delegationId: string, generation: number) {
    if (!this.checkin) return;
    const signal = this.work.signal;
    this.activeDelegations++; this.publish("thinking");
    try {
      const result = await abortable(this.config.application.onDelegation({ ownerId: this.ownerId, deviceId: this.deviceId, checkinId: this.checkin.id,
        delegationId, transcripts: this.transcripts.map((part) => ({ ...part })), signal }), signal);
      if (signal.aborted || generation !== this.generation || this.closing) return;
      for (const key of ["thinking", "commentary"] as const) {
        const content = result[key];
        if (content !== undefined) {
          if (typeof content !== "string" || !content.length || Buffer.byteLength(content) > 1500) throw new Error("Delegation content exceeds the append limit.");
          this.live!.send({ type: `session.${key}.append`, delegation_id: delegationId, content });
        }
      }
      this.checkin = await this.owned(await this.config.application.loadCheckin(this.db, this.ownerId, this.deviceId, this.checkin.id));
      if (signal.aborted || generation !== this.generation || this.closing) return;
      if (result.reviewRevision !== undefined) {
        const authoritative = await this.owned(await getCheckin(this.db, this.ownerId, this.checkin.id));
        if (signal.aborted || generation !== this.generation || this.closing) return;
        if (!Number.isInteger(result.reviewRevision) || result.reviewRevision < 1 || authoritative.draft_revision !== result.reviewRevision
          || !["draft", "awaiting_confirmation"].includes(authoritative.stage)) throw new DomainError(409, "revision_conflict", "The review revision is no longer current.");
        this.checkin = authoritative;
        const sameReview = this.armedReview?.checkinId === authoritative.id && this.armedReview.revision === result.reviewRevision
          && this.armedReview.generation === generation;
        this.armedReview = { checkinId: authoritative.id, revision: result.reviewRevision, generation,
          operationId: authoritative.confirmation?.draft_revision === result.reviewRevision ? authoritative.confirmation.operation_id
            : sameReview ? this.armedReview!.operationId : randomUUID() };
        this.speech.arm(this.armedReview);
      }
      if (this.checkin.stage === "draft" || this.checkin.stage === "awaiting_confirmation") this.publish("review");
    } catch (error) {
      if (!signal.aborted && generation === this.generation && !this.closing) { this.error(error instanceof DomainError ? error.code : "device_delegation_failed"); this.publish("error"); }
    } finally { this.activeDelegations--; }
  }
  private flush() {
    this.generation++; this.speech.clear(); this.armedReview = undefined; this.input.flush(); this.output.flush();
    this.json({ type: "flush", generation: this.generation });
  }
  private publish(state: DeviceState) {
    const changed = state !== this.state;
    this.state = state;
    if (changed || state === "stopped" || state === "review") this.json({ type: "state", state, checkin_id: this.checkin?.id ?? null,
      ...(state === "review" ? { draft_revision: this.checkin?.draft_revision,
        ...(this.armedReview ? { confirmation_phrases: CONFIRMATION_PHRASES } : {}) } : {}) });
  }
  private error(code: string) { this.json({ type: "error", code }); }
  private fatal(code: string) {
    if (this.closing) return;
    this.error(code); this.publish("error"); this.flush();
    void this.disconnect(); this.socket.close(1011, "device_session_failed");
  }
  private json(value: Record<string, unknown>) {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    // Leave bounded room for a control barrier even when PCM backpressure has
    // filled the audio allowance. Silently dropping flush would replay stale PCM.
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
    socket.end(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  };
  const upgrade = (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    let url: URL;
    try { url = new URL(request.url ?? "", "http://backend.invalid"); } catch { return; }
    if (url.pathname !== DEVICE_AUDIO_PATH) return;
    if (url.search || request.method !== "GET") { reject(socket, 400); return; }
    if (reserved || active || detached) { reject(socket, 409); return; }
    reserved = true;
    // Reserve the singleton slot before asynchronous auth to prevent concurrent
    // upgrades. No WebSocket is accepted until DB credentials are verified.
    void authenticateDevice(db, request.headers.authorization).then(async (device) => {
      const current = await authenticateDevice(db, request.headers.authorization);
      if (device.credential_revision !== current.credential_revision || detached || socket.destroyed) { reject(socket, 401); return; }
      wss.handleUpgrade(request, socket, head, (ws) => {
        active = new DeviceAudioConnection(ws, db, device.owner_id, device.id, config, dependencies.providerSocketFactory);
        const connection = active;
        ws.on("close", () => { if (active === connection) active = undefined; });
      });
    }).catch((error: unknown) => reject(socket, error instanceof DomainError && error.status === 401 ? 401 : 503))
      .finally(() => { reserved = false; });
  };
  server.on("upgrade", upgrade);
  return async () => {
    detached = true; server.off("upgrade", upgrade); unregister();
    active?.revoke(); await active?.disconnect(); wss.close();
  };
}
