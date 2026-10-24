import { z } from "zod";
// Production Functions receive private project variables directly. This avoids
// requiring a filesystem dotenv file in a deployed function bundle.
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BETTER_AUTH_SECRET: z.string().min(32), BETTER_AUTH_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(), CORS_ORIGINS: z.string().optional(),
  DATABASE_URL: z.string().min(1), DATABASE_API_KEY: z.string().optional(), DATABASE_AUTH_TOKEN: z.string().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional(), AZURE_OPENAI_ENDPOINT: z.string().optional(), AZURE_OPENAI_REALTIME_DEPLOYMENT: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(), OPENAI_API_KEY: z.string().optional(), OPENAI_BACKEND_MODEL: z.string().default("gpt-6-luna"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) throw new Error("Backend environment is missing required configuration.");
export const ENV = parsed.data;
