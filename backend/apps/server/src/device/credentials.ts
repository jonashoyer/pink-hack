import { createHash, randomBytes } from "node:crypto";
import type { Database } from "@backend/db";
import { devices } from "@backend/db/schema/device";
import { and, eq } from "drizzle-orm";
import { DomainError } from "../domain/errors";
import { write } from "../domain/store";

export const DEMO_DEVICE_ID = "demo";
export function hashDeviceToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
const revokeHandlers = new WeakMap<Database, () => void>();
export function registerDeviceRevocation(db: Database, revoke: () => void) {
  if (revokeHandlers.has(db)) throw new Error("Device audio is already attached to this database.");
  revokeHandlers.set(db, revoke);
  return () => revokeHandlers.delete(db);
}

export async function provisionDevice(db: Database, ownerId: string) {
  if (!ownerId) throw new DomainError(401, "unauthenticated", "Sign in to provision the demo device.");
  const token = randomBytes(32).toString("base64url");
  const timestamp = new Date().toISOString();
  const device = await write(db, async (tx) => {
    const [existing] = await tx.select().from(devices).where(eq(devices.id, DEMO_DEVICE_ID));
    if (existing && existing.owner_id !== ownerId) throw new DomainError(409, "device_already_owned", "The demo device belongs to another user.");
    if (existing) {
      const [rotated] = await tx.update(devices).set({ token_hash: hashDeviceToken(token), credential_revision: existing.credential_revision + 1, updated_at: timestamp })
        .where(and(eq(devices.id, DEMO_DEVICE_ID), eq(devices.owner_id, ownerId), eq(devices.credential_revision, existing.credential_revision))).returning();
      if (!rotated) throw new DomainError(409, "device_rotation_conflict", "Device credentials changed. Retry provisioning.");
      return rotated;
    }
    // The singleton primary key protects concurrent attempts by different users.
    const [created] = await tx.insert(devices).values({ id: DEMO_DEVICE_ID, owner_id: ownerId, token_hash: hashDeviceToken(token), created_at: timestamp, updated_at: timestamp }).returning();
    return created!;
  });
  revokeHandlers.get(db)?.();
  return { device_id: device.id, credential_revision: device.credential_revision, token, audio_path: "/api/v1/device/audio", audio: { type: "audio/pcm" as const, rate: 16000, channels: 1, sample_format: "s16le" as const, max_chunk_bytes: 2048, recommended_chunk_bytes: 1024 } };
}

export async function authenticateDevice(db: Database, authorization: string | undefined) {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization ?? "");
  if (!match) throw new DomainError(401, "device_unauthenticated", "A device bearer token is required.");
  const [device] = await db.select().from(devices).where(and(eq(devices.id, DEMO_DEVICE_ID), eq(devices.token_hash, hashDeviceToken(match[1]!))));
  if (!device) throw new DomainError(401, "device_unauthenticated", "The device credential is invalid.");
  return device;
}
