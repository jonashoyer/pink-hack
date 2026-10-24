import type { Database } from "@backend/db";
import { Hono } from "hono";
import { DomainError } from "../domain/errors";
import { provisionDevice } from "../device/credentials";

type Env = { Variables: { userId: string } };
export function createDeviceRoutes(db: Database): Hono<Env> {
  const app = new Hono<Env>();
  app.post("/device/provision", async (c) => {
    if (!c.get("userId")) throw new DomainError(401, "unauthenticated", "Sign in to provision the demo device.");
    // Provisioning accepts no owner, device ID or client-generated credential.
    const raw = await c.req.text();
    if (Buffer.byteLength(raw) > 1024) throw new DomainError(422, "invalid_input", "Provisioning accepts an empty JSON object.");
    if (raw.trim()) {
      let input: unknown;
      try { input = JSON.parse(raw); } catch { throw new DomainError(422, "invalid_input", "Provisioning accepts an empty JSON object."); }
      if (!input || Array.isArray(input) || typeof input !== "object" || Object.keys(input).length) throw new DomainError(422, "invalid_input", "Provisioning accepts an empty JSON object.");
    }
    c.header("Cache-Control", "no-store");
    c.header("Pragma", "no-cache");
    return c.json(await provisionDevice(db, c.get("userId")));
  });
  return app;
}
