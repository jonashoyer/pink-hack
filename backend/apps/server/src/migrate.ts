import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/libsql/migrator";
import { migrateLegacyData } from "./domain/journal";
import { db } from "./services";

try {
  await migrate(db, { migrationsFolder: fileURLToPath(new URL("../migrations/", import.meta.url)) });
  const result = await migrateLegacyData(db);
  console.log(JSON.stringify({ event: "database_migrated", result }));
} finally { db.$client.close(); }
