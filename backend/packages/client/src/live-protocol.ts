// Adapted from claude-impact-lab's verified Live client. No finance or demo state.
export type LiveEvent = {
  type: string; delta?: string; start_ms?: number; end_ms?: number;
  session?: { id?: string; model?: string; delegation?: { type?: string } | null };
  delegation?: { id?: string; target?: string };
  event?: { type: string; response_id?: string; response?: { id?: string }; item?: { type?: string; call_id?: string; name?: string; arguments?: string } };
};
export class LiveTranscripts {
  private sequence = 0;
  private current: Partial<Record<"user" | "assistant", { id: string; text: string; end: number }>> = {};
  private lastRole?: "user" | "assistant";
  append(event: LiveEvent) {
    const role: "user" | "assistant" | null = event.type === "session.input_transcript.delta" ? "user" : event.type === "session.output_transcript.delta" ? "assistant" : null;
    if (!role || typeof event.delta !== "string" || !event.delta) return null;
    const previous = this.current[role];
    const start = event.start_ms ?? previous?.end ?? 0;
    const end = event.end_ms ?? start;
    const newEntry = !previous || this.lastRole !== role || start - previous.end > 1500;
    const entry = { id: newEntry ? `live_${++this.sequence}` : previous.id, text: (newEntry ? "" : previous.text) + event.delta, end };
    this.current[role] = entry;
    this.lastRole = role;
    return { role, id: entry.id, text: entry.text, newEntry };
  }
}
export function liveThinkingParts(content: string, delegationId: string | null = null) {
  const characters = Array.from(content);
  const events = [];
  for (let offset = 0; offset < characters.length; offset += 350) events.push({ type: "session.thinking.append", event_id: crypto.randomUUID(), delegation_id: delegationId, content: characters.slice(offset, offset + 350).join("") });
  return events;
}
export function validLiveSession(event: LiveEvent, expected: { session: { id: string }; model: string; delegation: string }) {
  return event.type === "session.started" && event.session?.id === expected.session.id && event.session.model === expected.model
    && (event.session.delegation == null || event.session.delegation.type === expected.delegation);
}
export async function liveOffer(peer: RTCPeerConnection, signal: AbortSignal) {
  await peer.setLocalDescription(await peer.createOffer());
  if (peer.iceGatheringState !== "complete") await new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timer); peer.removeEventListener("icegatheringstatechange", changed); signal.removeEventListener("abort", cancelled);
      if (error) reject(error); else resolve();
    };
    const changed = () => { if (peer.iceGatheringState === "complete") finish(); };
    const cancelled = () => finish(new Error("Voice connection cancelled."));
    const timer = setTimeout(() => finish(new Error("Voice connection preparation timed out.")), 10000);
    peer.addEventListener("icegatheringstatechange", changed); signal.addEventListener("abort", cancelled, { once: true });
    if (signal.aborted) cancelled(); else changed();
  });
  if (signal.aborted || !peer.localDescription?.sdp) throw new Error("Voice connection cancelled.");
  return peer.localDescription.sdp;
}
