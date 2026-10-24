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
  z.object({ type: z.literal("start"), operation_id: operationIdSchema, checkin_id: recordIdSchema.optional() }).strict(),
  z.object({ type: z.literal("audio_turn_end") }).strict(),
  z.object({ type: z.literal("interrupt") }).strict(),
  z.object({ type: z.literal("stop") }).strict(),
  z.object({ type: z.literal("cancel") }).strict(),
  z.object({ type: z.literal("confirm"), draft_revision: z.number().int().min(1).max(2147483646), operation_id: operationIdSchema }).strict(),
]);
export type DeviceControl = z.infer<typeof deviceControlSchema>;
export type DeviceState = "connecting" | "listening" | "thinking" | "speaking" | "review" | "saved" | "error" | "stopped";
export type DeviceOwner = { ownerId: string; deviceId: string; checkinId: string };
export type DeviceTranscript = { role: "user" | "assistant"; text: string; startMs: number; endMs: number };
export type DelegationContext = DeviceOwner & {
  delegationId: string;
  transcripts: readonly DeviceTranscript[];
  signal: AbortSignal;
};
// reviewRevision is supplied by the application from the persisted draft, never
// parsed from model commentary or a tool argument that asks to confirm itself.
export type DelegationResult = { commentary?: string; thinking?: string; reviewRevision?: number };
export type ConfirmationContext = DeviceOwner & {
  draftRevision: number;
  operationId: string;
  receipt: string;
  signal: AbortSignal;
};
export type DeviceCheckin = { id: string; source: string; device_id?: string | null; stage: string; draft_revision: number; saved_entry_id?: string | null;
  confirmation?: { operation_id: string; draft_revision: number } | null };

// These are application adapters, not transport or provider selection settings.
// The domain owner supplies trusted creation/loading with a verified device ID.
export type DeviceApplication = {
  startCheckin(db: Database, ownerId: string, deviceId: string, operationId: string): Promise<DeviceCheckin>;
  loadCheckin(db: Database, ownerId: string, deviceId: string, checkinId: string): Promise<DeviceCheckin>;
  onDelegation(context: DelegationContext): Promise<DelegationResult>;
  onConfirmed(context: ConfirmationContext): Promise<{ entry_id: string; revision: number }>;
};
export type DeviceAudioConfig = VoiceConfig & {
  application: DeviceApplication;
  instructions: string;
};
