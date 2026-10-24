import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

// Reuse repository-local provider settings over stale inherited host values,
// as in claude-impact-lab. Never log or copy credentials into source files.
const env = { ...process.env };
for (const location of [new URL("../apps/server/.env", import.meta.url), new URL("../../.env", import.meta.url)]) {
  try {
    const local = parseEnv(await readFile(location, "utf8"));
    for (const key of ["NODE_ENV", "CORS_ORIGIN", "CORS_ORIGINS", "PORT", "DATABASE_URL", "DATABASE_API_KEY", "DATABASE_AUTH_TOKEN", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_REALTIME_DEPLOYMENT"]) {
      if (local[key]?.trim()) env[key] = local[key];
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
const development = process.argv[2] === "dev";
const migration = process.argv[2] === "migrate";
const child = spawn(development ? "pnpm" : process.execPath, development ? ["exec", "tsx", "watch", "src/index.ts"] : [migration ? "dist/migrate.mjs" : "dist/index.mjs"], {
  cwd: fileURLToPath(new URL("../apps/server/", import.meta.url)), env, stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal));
child.on("error", () => { console.error("Could not start the backend runtime."); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 0; });
