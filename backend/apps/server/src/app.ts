import type { Database } from "@backend/db";
import type { createAuth } from "@backend/auth";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { DomainError } from "./domain/errors";
import { createJournalRoutes } from "./routes/journal";
import { createVoiceRoutes, type VoiceConfig } from "./routes/voice";

type Auth = ReturnType<typeof createAuth>;
type AppConfig = VoiceConfig & { CORS_ORIGIN: string; CORS_ORIGINS?: string; BETTER_AUTH_URL: string };
type Variables = { userId: string; requestId: string };

export function createApp(db: Database, auth: Auth, config: AppConfig, providerFetch: typeof fetch = fetch) {
  const app = new Hono<{ Variables: Variables }>();
  const origins = [...new Set([config.CORS_ORIGIN, new URL(config.BETTER_AUTH_URL).origin, ...(config.CORS_ORIGINS?.split(",").map((value) => value.trim()).filter(Boolean) ?? [])])];
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
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["set-auth-token", "X-Request-Id"],
  }));
  app.use("/api/*", bodyLimit({ maxSize: 128 * 1024, onError: () => { throw new DomainError(413, "body_too_large", "Request exceeds 128 KB."); } }));
  // CORS governs response access, not permission to mutate records.
  app.use("/api/*", async (c, next) => {
    const origin = c.req.header("Origin");
    if (origin && !origins.includes(origin)) {
      throw new DomainError(403, "origin_rejected", "This browser origin is not allowed.");
    }
    await next();
  });
  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
  app.get("/health", (c) => c.json({ status: "ok", service: "pink-hack-backend" }));
  app.get("/", (c) => c.json({ service: "pink-hack-backend", health: "/health", api: "/api/v1" }));
  app.use("/api/v1/*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) throw new DomainError(401, "unauthenticated", "Sign in to continue.");
    c.set("userId", session.user.id);
    await next();
  });
  app.route("/api/v1", createJournalRoutes(db));
  app.route("/api/v1", createVoiceRoutes(db, config, providerFetch));
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
