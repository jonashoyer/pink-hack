import type { Database } from "@backend/db";
import { user } from "@backend/db/schema/auth";
import { DomainError } from "./domain/errors";

// The shared demo owner is server code, never an environment/client selector.
export const DEMO_USER_ID = "demo-user";
export const DEMO_API_ORIGIN = "https://pink-hack.vercel.app";
const initialized = new WeakMap<Database, Promise<void>>();
export function ensureDemoOwner(db: Database): Promise<void> {
  const prior = initialized.get(db);
  if (prior) return prior;
  const ready = (async () => {
    try {
      await db.insert(user).values({ id: DEMO_USER_ID, name: "Demo user", email: "demo-user@pink-hack.invalid" }).onConflictDoNothing({ target: user.id });
    } catch {
      initialized.delete(db);
      throw new DomainError(503, "storage_unavailable", "Demo storage could not be initialized. Please retry.", true);
    }
  })();
  initialized.set(db, ready);
  return ready;
}
