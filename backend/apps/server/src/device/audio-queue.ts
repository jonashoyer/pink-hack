import { performance } from "node:perf_hooks";
import { MAX_AUDIO_QUEUE_BYTES, PCM_BYTES_PER_SECOND, PCM_CHUNK_BYTES } from "./contracts";

// Both directions use the same bounded, ordered, realtime-paced PCM queue.
export class PcmQueue {
  private chunks: Buffer[] = [];
  private bytes = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private nextAt = 0;
  private disposed = false;
  constructor(private readonly send: (chunk: Buffer) => void, private readonly fail: (error: Error) => void) {}
  enqueue(audio: Buffer) {
    if (this.disposed) throw new Error("Audio queue is closed.");
    if (!audio.length || audio.length % 2 || this.bytes + audio.length > MAX_AUDIO_QUEUE_BYTES) throw new Error("Audio queue limit exceeded.");
    // Copy because WebSocket receive buffers can outlive their callback.
    for (let offset = 0; offset < audio.length; offset += PCM_CHUNK_BYTES) this.chunks.push(Buffer.from(audio.subarray(offset, offset + PCM_CHUNK_BYTES)));
    this.bytes += audio.length;
    this.pump();
  }
  get queuedBytes() { return this.bytes; }
  flush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    this.chunks = [];
    this.bytes = 0;
    this.nextAt = 0;
  }
  dispose() { this.disposed = true; this.flush(); }
  private pump() {
    if (this.disposed || this.timer || !this.chunks.length) return;
    const delay = Math.max(0, this.nextAt - performance.now());
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (this.disposed) return;
      const chunk = this.chunks.shift();
      if (!chunk) return;
      this.bytes -= chunk.length;
      try { this.send(chunk); } catch (error) { this.dispose(); this.fail(error instanceof Error ? error : new Error("Audio send failed.")); return; }
      this.nextAt = performance.now() + chunk.length / PCM_BYTES_PER_SECOND * 1000;
      this.pump();
    }, delay);
    this.timer.unref();
  }
}
