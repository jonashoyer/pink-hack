import { getRequestListener } from "@hono/node-server";
import { createApp } from "./app";
import { ENV } from "./env.server";
import { db } from "./services";
// Vercel HTTP Functions invoke a callable Node request listener. No listen()
// side effect is needed. Device audio is its native HTTP-server WS entrypoint.
export default getRequestListener(createApp(db, ENV).fetch);
