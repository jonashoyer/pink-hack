import { z } from "zod";
import { DomainError } from "../domain/errors";

export type VoiceConfig = {
  OPENAI_API_KEY?: string;
  OPENAI_BACKEND_MODEL: string;
  AZURE_OPENAI_API_KEY?: string;
  AZURE_OPENAI_ENDPOINT?: string;
  AZURE_OPENAI_REALTIME_DEPLOYMENT?: string;
};
export function plausibleLiveSdp(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("v=0") && Buffer.byteLength(value, "utf8") <= 65536
    && /^m=audio /m.test(value) && /^m=application /m.test(value);
}
// Adapted from claude-impact-lab's verified azure-live.ts and endpoint validator.
// Both Azure hostname forms are supported; secrets never follow redirects.
export function voiceProvider(config: VoiceConfig) {
  const endpoint = config.AZURE_OPENAI_ENDPOINT?.trim();
  const deployment = config.AZURE_OPENAI_REALTIME_DEPLOYMENT?.trim();
  const apiKey = config.AZURE_OPENAI_API_KEY?.trim();
  if (endpoint || deployment || apiKey) {
    if (!endpoint || !deployment || !apiKey) throw new DomainError(503, "voice_not_configured", "Configure all Azure Live endpoint, deployment and key settings on the backend.");
    let url: URL;
    try { url = new URL(endpoint); } catch { throw new DomainError(503, "voice_configuration_invalid", "Azure Live endpoint is invalid."); }
    const path = url.pathname.replace(/\/+$/, "");
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.search || url.hash
      || !/^[a-z0-9][a-z0-9-]*\.(?:openai|services\.ai)\.azure\.com$/i.test(url.hostname)
      || (path !== "" && path !== "/openai/v1") || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/.test(deployment) || /\s/.test(apiKey)) {
      throw new DomainError(503, "voice_configuration_invalid", "Azure Live configuration is invalid.");
    }
    return { provider: "azure" as const, url: `${url.origin}/openai/v1/live/sessions`, key: apiKey, headers: { "api-key": apiKey }, model: deployment, delegation: "client" as const };
  }
  if (!config.OPENAI_API_KEY) throw new DomainError(503, "voice_not_configured", "Configure Azure Live credentials or OPENAI_API_KEY on the backend to enable voice.");
  return { provider: "openai" as const, url: "https://api.openai.com/v1/live/sessions", key: config.OPENAI_API_KEY, headers: { Authorization: `Bearer ${config.OPENAI_API_KEY}` }, model: "gpt-live-1", delegation: "responses" as const };
}
const answerSchema = z.object({ session: z.object({ id: z.string().min(1).max(256), model: z.string().optional() }), transport: z.object({ type: z.literal("webrtc").optional(), sdp: z.string().refine(plausibleLiveSdp) }) });
export async function readLiveAnswer(response: Response, provider: ReturnType<typeof voiceProvider>) {
  if (!response.ok) throw new DomainError(502, "voice_provider_failed", "The Live provider rejected session initialization. Check the backend's project access and configuration.");
  const text = await response.text();
  if (Buffer.byteLength(text, "utf8") > 262144) throw new DomainError(502, "voice_provider_response_invalid", "The Live provider returned too much session data.");
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new DomainError(502, "voice_provider_response_invalid", "The Live provider returned invalid JSON."); }
  const parsed = answerSchema.safeParse(raw);
  if (!parsed.success || parsed.data.session.id.includes(provider.key) || parsed.data.transport.sdp.includes(provider.key)
    || (parsed.data.session.model !== undefined && parsed.data.session.model !== provider.model)) {
    throw new DomainError(502, "voice_provider_response_invalid", "The Live provider returned an unexpected session answer.");
  }
  return { session: { id: parsed.data.session.id }, transport: { type: "webrtc" as const, sdp: parsed.data.transport.sdp } };
}
