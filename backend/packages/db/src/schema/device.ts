import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

// A primary key plus a CHECK constraint makes the demo slot a DB invariant.
export const devices = sqliteTable("devices", {
  id: text("id").primaryKey(),
  owner_id: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token_hash: text("token_hash").notNull().unique(),
  credential_revision: integer("credential_revision").notNull().default(1),
  lease_id: text("lease_id"),
  lease_expires_at: integer("lease_expires_at"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
}, (table) => [check("devices_demo_slot", sql`${table.id} = 'demo'`)]);
