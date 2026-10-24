import WebSocket from "ws";
import type { RawData, ClientOptions } from "ws";
import { randomUUID } from "node:crypto";
import { DomainError } from "../domain/errors";
import { voiceProvider } from "../voice/provider";
import type { DeviceAudioConfig } from "./contracts";
import { MAX_AUDIO_QUEUE_BYTES, PCM_RATE } from "./contracts";

export type ProviderSocketFactory = (url: string, options: ClientOptions) => WebSocket;
export type LiveEvent = Record<string, unknown> & { type: string };
export function rawBuffer(data: RawData) { return Array.isArray(data) ? Buffer.concat(data) : Buffer.isBuffer(data) ? data : Buffer.from(data); }
export class DeviceLiveSession {
  private socket?: WebSocket;
  private started = false;
  private closing = false;
  private closed = false;
  private closePromise?: Promise<boolean>;
  private onStarted?: () => void;
  private onFailed?: (error: Error) => void;
  private onClosed?: (graceful: boolean) => void;
  constructor(private readonly config: DeviceAudioConfig, private readonly event: (event: LiveEvent) => void,
    private readonly failure: () => void, private readonly factory: ProviderSocketFactory = (url, options) => new WebSocket(url, options)) {}

  async start() {
    const provider = voiceProvider(this.config);
    if (provider.provider !== "azure") throw new DomainError(503, "device_voice_not_configured", "The demo device requires the configured Azure Live backend.");
    const url = new URL(provider.url); url.protocol = "wss:";
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new DomainError(504, "device_voice_timeout", "Azure Live did not start.")), 15000);
      timer.unref();
      this.onStarted = () => { clearTimeout(timer); resolve(); };
      this.onFailed = (error) => { clearTimeout(timer); reject(error); };
      this.socket = this.factory(url.toString(), { headers: { "api-key": provider.key }, followRedirects: false, maxPayload: 262144, handshakeTimeout: 15000 });
      this.socket.on("open", () => {
        if (this.closing) { this.socket?.close(); return; }
        this.send({ type: "session.start", session: { model: provider.model, instructions: this.config.instructions,
          audio: { format: { type: "audio/pcm", rate: PCM_RATE }, output: { voice: "marin" } }, delegation: { type: "client" }, store: false } }, true);
      });
      this.socket.on("message", (data, binary) => {
        if (binary) { this.failed(); return; }
        let raw: unknown;
        try { raw = JSON.parse(rawBuffer(data).toString("utf8")); } catch { this.failed(); return; }
        if (!raw || typeof raw !== "object" || typeof (raw as LiveEvent).type !== "string") { this.failed(); return; }
        const event = raw as LiveEvent;
        if (event.type === "session.closed") { this.closed = true; this.onClosed?.(true); this.socket?.close(); return; }
        if (this.closing) return;
        if (event.type === "error") { this.failed(); return; }
        if (event.type === "session.started") {
          console.log(JSON.stringify({ debug: "live_session_started", audio: (event.session as { audio?: unknown } | undefined)?.audio ?? null })); // TEMP DEBUG
          const session = event.session as { model?: unknown; audio?: { format?: { type?: unknown; rate?: unknown } } } | undefined;
          if (!session || (session.model !== undefined && session.model !== provider.model)
            || (session.audio?.format && (session.audio.format.type !== "audio/pcm" || session.audio.format.rate !== PCM_RATE))) { this.failed(); return; }
          this.started = true; this.onStarted?.(); return;
        }
        if (!this.started) { this.failed(); return; }
        this.event(event);
      });
      this.socket.on("error", () => this.failed());
      this.socket.on("close", () => { this.onClosed?.(this.closed); if (!this.closing) this.failed(); });
    }).catch((error) => { this.socket?.terminate(); throw error; });
  }
  send(event: Record<string, unknown>, startup = false) {
    if (this.closing || !this.socket || this.socket.readyState !== WebSocket.OPEN || (!startup && !this.started)) throw new Error("Live session is unavailable.");
    if (this.socket.bufferedAmount > MAX_AUDIO_QUEUE_BYTES * 2) throw new Error("Live output buffer limit exceeded.");
    this.socket.send(JSON.stringify({ ...event, event_id: randomUUID() }), (error) => { if (error) this.failed(); });
  }
  append(audio: Buffer) { this.send({ type: "session.input_audio.append", audio: audio.toString("base64") }); }
  close(): Promise<boolean> {
    if (this.closePromise) return this.closePromise;
    this.closing = true;
    // Register the terminal receiver before issuing session.close.
    this.closePromise = new Promise<boolean>((resolve) => {
      const finish = (graceful: boolean) => { clearTimeout(timer); this.socket?.terminate(); resolve(graceful); };
      const timer = setTimeout(() => finish(false), 15000); timer.unref();
      this.onClosed = finish;
      if (this.closed) { finish(true); return; }
      if (this.socket?.readyState === WebSocket.OPEN && this.started) {
        this.socket.send(JSON.stringify({ type: "session.close", event_id: randomUUID() }), (error) => { if (error) finish(false); });
      } else { this.onFailed?.(new Error("Live startup was canceled.")); finish(false); }
    });
    return this.closePromise;
  }
  private failed() {
    this.onFailed?.(new DomainError(502, "device_voice_failed", "Azure Live could not complete the device session."));
    if (!this.closing) { this.failure(); this.socket?.terminate(); }
  }
}
