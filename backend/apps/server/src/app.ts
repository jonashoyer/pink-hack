import type { Database } from "@backend/db";
import { DEMO_API_ORIGIN, DEMO_USER_ID, ensureDemoOwner } from "./demo-owner";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { DomainError } from "./domain/errors";
import { createJournalRoutes } from "./routes/journal";
import { createVoiceRoutes, type VoiceConfig } from "./routes/voice";
import { createAssistantRoutes } from "./routes/assistant";
import { createDeviceRoutes } from "./routes/device";

type AppConfig = VoiceConfig & { ANTHROPIC_API_KEY?: string; CORS_ORIGIN: string; CORS_ORIGINS?: string };
type Variables = { userId: string; requestId: string };

export function createApp(db: Database, config: AppConfig, providerFetch: typeof fetch = fetch) {
  const app = new Hono<{ Variables: Variables }>();
  const origins = [...new Set([config.CORS_ORIGIN, DEMO_API_ORIGIN, ...(config.CORS_ORIGINS?.split(",").map((value) => value.trim()).filter(Boolean) ?? [])])];
  for (const origin of origins) {
    const parsed = new URL(origin);
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin) throw new Error("CORS origins must be exact HTTP origins.");
  }
  app.use("*", requestId({ headerName: "" }));
  app.use("*", secureHeaders());
  app.use("/api/*", async (c, next) => {
    c.header("Cache-Control", "no-store");
    await next();
  });
  app.use("*", cors({
    origin: origins,
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    exposeHeaders: ["X-Request-Id"],
  }));
  app.use("/api/*", bodyLimit({ maxSize: 512 * 1024, onError: () => { throw new DomainError(413, "body_too_large", "Request exceeds 512 KiB."); } }));
  // CORS governs response access, not permission to mutate records.
  app.use("/api/*", async (c, next) => {
    const origin = c.req.header("Origin");
    if (origin && !origins.includes(origin)) {
      throw new DomainError(403, "origin_rejected", "This browser origin is not allowed.");
    }
    await next();
  });
  app.get("/health", (c) => c.json({ status: "ok", service: "pink-hack-backend" }));
  app.get("/", (c) => c.json({ service: "pink-hack-backend", health: "/health", api: "/api/v1" }));
  app.use("/api/v1/*", async (c, next) => {
    await ensureDemoOwner(db);
    c.set("userId", DEMO_USER_ID);
    await next();
  });
  app.route("/api/v1", createJournalRoutes(db));
  app.route("/api/v1", createVoiceRoutes(db, config, providerFetch));
  app.route("/api/v1", createAssistantRoutes(db, config));
  app.route("/api/v1", createDeviceRoutes(db));
  app.notFound((c) => c.json({ error: { code: "not_found", message: "Endpoint not found.", retryable: false }, request_id: c.get("requestId") }, 404));
  app.onError((error, c) => {
    if (error instanceof DomainError) {
      return c.json({ error: { code: error.code, message: error.message, retryable: error.retryable }, request_id: c.get("requestId") }, error.status as 400);
    }
    // Raw database/provider errors can contain private journal data.
    console.error(JSON.stringify({ event: "request_failed", request_id: c.get("requestId") }));
    return c.json({ error: { code: "internal_error", message: "The request could not be completed.", retryable: true }, request_id: c.get("requestId") }, 500);
  });
  return app;
}
