import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/libsql/migrator";
import { migrateLegacyData } from "./domain/journal";
import { ensureDemoOwner } from "./demo-owner";
import { db } from "./services";

try {
  await migrate(db, { migrationsFolder: fileURLToPath(new URL("../../../packages/db/src/migrations/", import.meta.url)) });
  await ensureDemoOwner(db);
  const result = await migrateLegacyData(db);
  console.log(JSON.stringify({ event: "database_migrated", result }));
} catch {
  console.error(JSON.stringify({ event: "database_migration_failed" }));
  process.exitCode = 1;
} finally { db.$client.close(); }
