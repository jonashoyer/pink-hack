import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";

const target = new URL("../apps/server/.env", import.meta.url);
const content = [
  "NODE_ENV=development",
  `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`,
  "BETTER_AUTH_URL=http://localhost:3000",
  "CORS_ORIGIN=http://localhost:5173",
  "DATABASE_URL=file:../../local.db",
  "DATABASE_AUTH_TOKEN=",
  "OPENAI_API_KEY=",
  "OPENAI_BACKEND_MODEL=gpt-6-luna",
  "PORT=3000",
  "",
].join("\n");
try {
  await writeFile(target, content, { flag: "wx", mode: 0o600 });
  console.log("Created local server environment with a random authentication secret.");
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.log("Local server environment already exists; preserved it.");
}
