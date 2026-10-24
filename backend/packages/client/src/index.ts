import { LiveTranscripts, liveOffer, liveThinkingParts, validLiveSession, type LiveEvent } from "./live-protocol";
export * from "./live-protocol";

export type VoiceSession = { id: string; voice_session_id: string; provider: "azure" | "openai"; model: string; delegation: "client" | "responses"; session: { id: string }; transport: { type: "webrtc"; sdp: string } };
export type VoiceOptions = {
  apiBaseUrl: string; entryId?: string;
  onStatus: (status: "connecting" | "listening" | "closing" | "closed" | "error") => void;
  onTranscript?: (fragment: NonNullable<ReturnType<LiveTranscripts["append"]>>) => void;
  onError?: (message: string) => void;
  // Azure client delegation has metadata, not task text. The app's agent must
  // use these lossy transcripts and verified backend state, honoring cancellation.
  onDelegation: (input: { delegationId: string; transcripts: { role: "user" | "assistant"; text: string }[]; voiceSessionId: string; entryId?: string; signal: AbortSignal }) => Promise<string>;
};
/** Call start() directly from a user action. No account/session token is needed; provider keys remain server-side. */
export function createVoiceConnection(options: VoiceOptions) {
  let peer: RTCPeerConnection | undefined;
  let channel: RTCDataChannel | undefined;
  let microphone: MediaStream | undefined;
  let audio: HTMLAudioElement | undefined;
  let session: VoiceSession | undefined;
  let startup: AbortController | undefined;
  let backendWork: AbortController | undefined;
  let delegationRunning = false;
  let ready = false;
  let closeResolver: ((confirmed: boolean) => void) | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let readyTimer: ReturnType<typeof setTimeout> | undefined;
  let readyResolver: (() => void) | undefined;
  let readyRejecter: ((error: Error) => void) | undefined;
  const transcripts = new LiveTranscripts();
  const history = new Map<string, { role: "user" | "assistant"; text: string }>();
  const delegationIds = new Set<string>();
  const calls = new Map<string, { call_id: string; name: string; arguments: string }[]>();
  const handledCalls = new Set<string>();
  const post = async (path: string, body: unknown, signal?: AbortSignal) => {
    const response = await fetch(`${options.apiBaseUrl.replace(/\/$/, "")}/api/v1${path}`, {
      method: "POST", credentials: "omit", signal,
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const value = await response.json();
    if (!response.ok) throw new Error(value.error?.message ?? "The backend request failed.");
    return value;
  };
  const send = (event: object) => { if (channel?.readyState === "open") channel.send(JSON.stringify(event)); };
  const cleanup = () => {
    ready = false; clearTimeout(closeTimer); clearTimeout(readyTimer);
    startup?.abort(); backendWork?.abort(); microphone?.getTracks().forEach((track) => track.stop());
    channel?.close(); peer?.close(); if (audio) { audio.pause(); audio.srcObject = null; }
    channel = undefined; peer = undefined; microphone = undefined; audio = undefined;
  };
  const fail = (message: string) => {
    readyRejecter?.(new Error(message)); readyRejecter = undefined;
    closeResolver?.(false); closeResolver = undefined; cleanup(); options.onStatus("error"); options.onError?.(message);
  };
  const finishResponses = async (responseId: string) => {
    const batch = calls.get(responseId) ?? []; calls.delete(responseId);
    if (!batch.length || !session || !ready) return;
    await Promise.all(batch.map(async (call) => {
      let output: unknown;
      try { output = (await post(`/voice/sessions/${session!.id}/tools`, { call_id: call.call_id, name: call.name, arguments: JSON.parse(call.arguments) })).output; }
      catch { output = { error: "Tool request failed. Read current journal state before retrying.", saved: false }; }
      if (ready) send({ type: "response.item.create", item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) } });
    }));
    if (ready) send({ type: "response.create" });
  };
  const eventHandler = (event: LiveEvent) => {
    if (event.type === "error") { fail("The voice provider reported an error."); return; }
    if (event.type === "session.closed") {
      closeResolver?.(true); closeResolver = undefined; cleanup(); options.onStatus("closed"); return;
    }
    if (event.type === "session.started") {
      if (!session || !validLiveSession(event, session)) { fail("Voice returned an unexpected session."); return; }
      ready = true; clearTimeout(readyTimer); microphone?.getAudioTracks().forEach((track) => { track.enabled = true; });
      if (audio) { audio.muted = false; void audio.play().catch(() => options.onError?.("Allow audio playback to hear the assistant.")); }
      readyResolver?.(); readyResolver = undefined; readyRejecter = undefined; options.onStatus("listening"); return;
    }
    if (!ready) return;
    const transcript = transcripts.append(event);
    if (transcript) {
      history.set(transcript.id, { role: transcript.role, text: transcript.text });
      if (history.size > 2000 || [...history.values()].reduce((n, part) => n + part.text.length, 0) > 24000) { fail("Conversation context is full. Start a new voice session; no speech was silently dropped."); return; }
      if (transcript.role === "user" && delegationRunning) backendWork?.abort();
      options.onTranscript?.(transcript);
    }
    const delegationId = event.delegation?.id;
    if (session?.delegation === "client" && event.type === "session.delegation.created" && delegationId && !delegationIds.has(delegationId)) {
      delegationIds.add(delegationId); backendWork?.abort(); const work = new AbortController(); backendWork = work; delegationRunning = false;
      // Allow trailing transcript fragments to arrive; these are not final turns.
      setTimeout(() => {
        if (!ready || work.signal.aborted) return;
        delegationRunning = true;
        const turns: { role: "user" | "assistant"; text: string }[] = [];
        for (const part of history.values()) {
          const last = turns.at(-1);
          if (last?.role === part.role) last.text += part.text;
          else turns.push({ ...part });
        }
        if (turns.length > 24) { fail("Conversation context is full. Start a new voice session."); return; }
        void options.onDelegation({ delegationId, transcripts: turns, voiceSessionId: session!.voice_session_id, entryId: options.entryId, signal: work.signal }).then((result) => {
          if (ready && !work.signal.aborted) liveThinkingParts(result, delegationId).forEach(send);
        }).catch(() => {
          if (ready && !work.signal.aborted) liveThinkingParts("The backend task failed. No successful save is confirmed. Ask the user to review the app or retry.", delegationId).forEach(send);
        }).finally(() => { if (backendWork === work) delegationRunning = false; });
      }, 200);
    }
    if (session?.delegation === "responses" && event.type === "response.event" && event.event) {
      const nested = event.event;
      const responseId = nested.response_id ?? nested.response?.id;
      const item = nested.item;
      if (nested.type === "response.output_item.done" && responseId && item?.type === "function_call" && item.call_id && item.name && item.arguments && !handledCalls.has(item.call_id)) {
        handledCalls.add(item.call_id); const batch = calls.get(responseId) ?? [];
        batch.push({ call_id: item.call_id, name: item.name, arguments: item.arguments }); calls.set(responseId, batch);
      }
      if (nested.type === "response.completed" && responseId) void finishResponses(responseId);
    }
  };
  return {
    async start(): Promise<VoiceSession> {
      if (peer || (startup && !startup.signal.aborted)) throw new Error("Voice is already connecting or connected.");
      options.onStatus("connecting"); startup = new AbortController();
      try {
        microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (startup.signal.aborted) { microphone.getTracks().forEach((track) => track.stop()); throw new Error("Voice connection cancelled."); }
        peer = new RTCPeerConnection(); audio = new Audio(); audio.autoplay = true; audio.muted = true;
        peer.addEventListener("track", ({ track }) => { if (audio) audio.srcObject = new MediaStream([track]); });
        microphone.getAudioTracks().forEach((track) => { track.enabled = false; peer!.addTrack(track, microphone!); });
        channel = peer.createDataChannel("oai-events");
        channel.addEventListener("message", ({ data }) => { try { eventHandler(JSON.parse(data)); } catch { fail("Voice returned an unreadable event."); } });
        channel.addEventListener("close", () => { if (ready) fail("Voice disconnected before finalization was confirmed."); });
        const sdp = await liveOffer(peer, startup.signal);
        session = await post("/voice/sessions", { ...(options.entryId ? { entry_id: options.entryId } : {}), operation_id: crypto.randomUUID(), transport: { type: "webrtc", sdp } }, startup.signal) as VoiceSession;
        const started = new Promise<void>((resolve, reject) => { readyResolver = resolve; readyRejecter = reject; readyTimer = setTimeout(() => fail("Voice startup timed out."), 20000); });
        await peer.setRemoteDescription({ type: "answer", sdp: session.transport.sdp });
        await started;
        return session;
      } catch (error) { cleanup(); options.onStatus("error"); throw error; }
    },
    async close(): Promise<{ confirmed: boolean }> {
      if (!ready || channel?.readyState !== "open") { readyRejecter?.(new Error("Voice connection cancelled.")); readyRejecter = undefined; cleanup(); options.onStatus("closed"); return { confirmed: false }; }
      ready = false; backendWork?.abort(); microphone?.getAudioTracks().forEach((track) => { track.enabled = false; });
      if (audio) audio.muted = true;
      options.onStatus("closing");
      const confirmed = await new Promise<boolean>((resolve) => {
        closeResolver = resolve; closeTimer = setTimeout(() => { closeResolver = undefined; cleanup(); options.onStatus("closed"); resolve(false); }, 15000);
        send({ type: "session.close" });
      });
      return { confirmed };
    },
  };
}
