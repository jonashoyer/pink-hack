import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { Database } from "@backend/db";
import { devices } from "@backend/db/schema/device";
import { and, eq, gt, isNull, lte, or, sql } from "drizzle-orm";
import { DomainError } from "../domain/errors";

export const DEVICE_LEASE_MS = 30000;
export const DEVICE_HEARTBEAT_MS = 10000;
const databaseNow = sql`cast((julianday('now') - 2440587.5) * 86400000 as integer)`;
export type DeviceLease = {
  id: string; deviceId: string; ownerId: string; tokenHash: string; credentialRevision: number;
  expiresAt: number; deadline: number;
};
export async function claimDeviceLease(db: Database, device: typeof devices.$inferSelect): Promise<DeviceLease> {
  const id = randomUUID();
  const started = performance.now();
  const [claimed] = await db.update(devices).set({ lease_id: id, lease_expires_at: sql`${databaseNow} + ${DEVICE_LEASE_MS}` })
    .where(and(eq(devices.id, device.id), eq(devices.owner_id, device.owner_id), eq(devices.token_hash, device.token_hash),
      eq(devices.credential_revision, device.credential_revision), or(isNull(devices.lease_id), isNull(devices.lease_expires_at), lte(devices.lease_expires_at, databaseNow))))
    .returning({ expiresAt: devices.lease_expires_at });
  if (!claimed) throw new DomainError(409, "device_session_active", "The demo device already has an active connection or its credential changed.");
  const lease = { id, deviceId: device.id, ownerId: device.owner_id, tokenHash: device.token_hash, credentialRevision: device.credential_revision,
    expiresAt: claimed.expiresAt!, deadline: started + DEVICE_LEASE_MS - 1000 };
  if (performance.now() >= lease.deadline) {
    await releaseDeviceLease(db, lease);
    throw new DomainError(503, "device_lease_timeout", "Device lease acquisition took too long.");
  }
  return lease;
}
export async function renewDeviceLease(db: Database, lease: DeviceLease): Promise<boolean> {
  const started = performance.now();
  const [renewed] = await db.update(devices).set({ lease_expires_at: sql`${databaseNow} + ${DEVICE_LEASE_MS}` })
    .where(and(eq(devices.id, lease.deviceId), eq(devices.owner_id, lease.ownerId), eq(devices.lease_id, lease.id),
      eq(devices.token_hash, lease.tokenHash), eq(devices.credential_revision, lease.credentialRevision), gt(devices.lease_expires_at, databaseNow)))
    .returning({ expiresAt: devices.lease_expires_at });
  if (!renewed || performance.now() >= started + DEVICE_LEASE_MS - 1000) return false;
  lease.expiresAt = renewed.expiresAt!;
  lease.deadline = started + DEVICE_LEASE_MS - 1000;
  return true;
}
export async function releaseDeviceLease(db: Database, lease: DeviceLease): Promise<void> {
  // An expired owner must never release a newer instance's lease.
  await db.update(devices).set({ lease_id: null, lease_expires_at: null })
    .where(and(eq(devices.id, lease.deviceId), eq(devices.lease_id, lease.id)));
}

export class DeviceLeaseGuard {
  private heartbeat?: ReturnType<typeof setTimeout>;
  private expiry?: ReturnType<typeof setTimeout>;
  private closed = false;
  constructor(private readonly db: Database, readonly lease: DeviceLease, private readonly lost: () => void) {
    this.scheduleExpiry(); this.scheduleHeartbeat();
  }
  valid(): boolean {
    if (this.closed) return false;
    if (performance.now() >= this.lease.deadline) { this.fail(); return false; }
    return true;
  }
  async close() {
    if (this.closed) return;
    this.closed = true;
    if (this.heartbeat) clearTimeout(this.heartbeat);
    if (this.expiry) clearTimeout(this.expiry);
    // Best effort release. If storage is unavailable the durable TTL expires.
    await releaseDeviceLease(this.db, this.lease).catch(() => {});
  }
  private fail() { if (this.closed) return; this.lost(); void this.close(); }
  private scheduleExpiry() {
    if (this.expiry) clearTimeout(this.expiry);
    this.expiry = setTimeout(() => this.fail(), Math.max(0, this.lease.deadline - performance.now()));
    this.expiry.unref();
  }
  private scheduleHeartbeat() {
    this.heartbeat = setTimeout(() => {
      if (!this.valid()) return;
      void renewDeviceLease(this.db, this.lease).then((renewed) => {
        if (this.closed) return;
        if (!renewed || !this.valid()) { this.fail(); return; }
        this.scheduleExpiry(); this.scheduleHeartbeat();
      }).catch(() => this.fail());
    }, DEVICE_HEARTBEAT_MS);
    this.heartbeat.unref();
  }
}
