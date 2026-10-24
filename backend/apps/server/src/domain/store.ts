import { createHash } from "node:crypto";
import type { Database } from "@backend/db";
import { DomainError } from "./errors";

export type Store = Pick<Database, "select" | "insert" | "update">;
export const missing = () => new DomainError(404, "not_found", "Record was not found.");
export const conflict = () => new DomainError(409, "revision_conflict", "Revision changed. Reload the record before retrying.");
export const now = () => new Date().toISOString();
export async function write<T>(db: Database, fn: (tx: Store) => Promise<T>): Promise<T> {
  try { return await db.transaction(fn); }
  catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError(503, "storage_unavailable", "Storage failed. Reload and retry with the same operation ID.", true);
  }
}
export function fingerprint(value: unknown): string {
  const canonical = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(canonical);
    if (v !== null && typeof v === "object") return Object.fromEntries(Object.entries(v).filter(([, item]) => item !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
    return v;
  };
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}
