import type { Database } from "@backend/db";
import { z } from "zod";
import { operationIdSchema, recordIdSchema } from "../domain/contracts";
import type { VoiceConfig } from "../voice/provider";

export const DEVICE_AUDIO_PATH = "/api/v1/device/audio";
export const PCM_RATE = 16000;
export const PCM_BYTES_PER_SECOND = PCM_RATE * 2;
export const PCM_CHUNK_BYTES = 1024;
export const MAX_PCM_CHUNK_BYTES = 2048;
export const MAX_AUDIO_QUEUE_BYTES = PCM_BYTES_PER_SECOND * 2;

export const deviceControlSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("start"), operation_id: operationIdSchema, voice_session_id: recordIdSchema.optional(), entry_id: recordIdSchema.optional() }).strict(),
  z.object({ type: z.literal("audio_turn_end") }).strict(),
  z.object({ type: z.literal("interrupt") }).strict(),
  z.object({ type: z.literal("stop") }).strict(),
  z.object({ type: z.literal("cancel") }).strict(),
]);
export type DeviceControl = z.infer<typeof deviceControlSchema>;
export type DeviceState = "connecting" | "listening" | "thinking" | "speaking" | "error" | "stopped";
export type DeviceOwner = { ownerId: string; deviceId: string; voiceSessionId: string };
export type DeviceTranscript = { role: "user" | "assistant"; text: string; startMs: number; endMs: number };
export type DelegationContext = DeviceOwner & {
  delegationId: string;
  transcripts: readonly DeviceTranscript[];
  signal: AbortSignal;
};
export type DelegationResult = { text?: string; entries: Array<{ id: string; revision: number }> };
export type DeviceConversation = { id: string; source: "app" | "atech"; device_id?: string | null; state: "active" | "stopped"; last_entry_id: string | null };

// These are application adapters, not transport or provider selection settings.
// The domain owner supplies trusted creation/loading with a verified device ID.
export type DeviceApplication = {
  startConversation(db: Database, ownerId: string, deviceId: string, operationId: string, entryId?: string): Promise<DeviceConversation>;
  readConversation(db: Database, ownerId: string, deviceId: string, voiceSessionId: string): Promise<DeviceConversation>;
  onDelegation(context: DelegationContext): Promise<DelegationResult>;
};
export type DeviceAudioConfig = VoiceConfig & {
  application: DeviceApplication;
  instructions: string;
};
