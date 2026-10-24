import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { ENV } from "./env.server";
import { auth, db } from "./services";

const app = createApp(db, auth, ENV);
const server = serve({ fetch: app.fetch, port: ENV.PORT }, (info) => {
  console.log(`Pink Hack backend listening on http://localhost:${info.port}`);
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(() => { db.$client.close(); process.exit(0); });
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
