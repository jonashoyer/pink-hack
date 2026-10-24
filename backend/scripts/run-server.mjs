import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

// Reuse repository-local provider settings over stale inherited host values,
// as in claude-impact-lab. Never log or copy credentials into source files.
const env = { ...process.env };
for (const location of [new URL("../../.env", import.meta.url), new URL("../apps/server/.env", import.meta.url)]) {
  try {
    const local = parseEnv(await readFile(location, "utf8"));
    for (const key of ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_REALTIME_DEPLOYMENT"]) {
      if (local[key]?.trim()) env[key] = local[key];
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
const development = process.argv[2] === "dev";
const child = spawn(development ? "pnpm" : process.execPath, development ? ["exec", "tsx", "watch", "src/index.ts"] : ["dist/index.mjs"], {
  cwd: fileURLToPath(new URL("../apps/server/", import.meta.url)), env, stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal));
child.on("error", () => { console.error("Could not start the backend runtime."); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 0; });
