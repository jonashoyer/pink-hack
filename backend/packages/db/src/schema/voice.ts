import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { voiceConversations } from "./journal";
import { user } from "./auth";

export const voiceSessions = sqliteTable("voice_sessions", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  checkinId: text("checkin_id").notNull(),
  operationId: text("operation_id").notNull(),
  providerSessionId: text("provider_session_id"),
  state: text("state", { enum: ["creating", "active", "failed"] }).notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [uniqueIndex("voice_owner_operation").on(table.ownerId, table.operationId)]);

export const voiceToolCalls = sqliteTable("voice_tool_calls", {
  id: text("id").primaryKey(),
  voiceSessionId: text("voice_session_id").notNull().references(() => voiceSessions.id, { onDelete: "cascade" }),
  callId: text("call_id").notNull(),
  name: text("name").notNull(),
  argumentsHash: text("arguments_hash").notNull(),
  result: text("result", { mode: "json" }).$type<unknown>().notNull(),
}, (table) => [uniqueIndex("voice_session_call").on(table.voiceSessionId, table.callId)]);

// Active browser transport metadata is separate from legacy check-in sessions.
export const browserVoiceSessions = sqliteTable("browser_voice_sessions", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id").references(() => voiceConversations.id),
  operationId: text("operation_id").notNull(),
  providerSessionId: text("provider_session_id"),
  state: text("state", { enum: ["creating", "active", "failed"] }).notNull(),
  createdAt: integer("created_at").notNull(),
}, table => [uniqueIndex("browser_voice_owner_operation").on(table.ownerId, table.operationId)]);
export const browserVoiceToolCalls = sqliteTable("browser_voice_tool_calls", {
  id: text("id").primaryKey(),
  voiceSessionId: text("voice_session_id").notNull().references(() => browserVoiceSessions.id, { onDelete: "cascade" }),
  callId: text("call_id").notNull(), name: text("name").notNull(), argumentsHash: text("arguments_hash").notNull(),
  result: text("result", { mode: "json" }).$type<unknown>().notNull(),
}, table => [uniqueIndex("browser_voice_session_call").on(table.voiceSessionId, table.callId)]);

// Durable callback receipts contain outcomes/IDs, never proposed journal content.
export const agentDelegations = sqliteTable("agent_delegations", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  conversationId: text("voice_conversation_id").notNull().references(() => voiceConversations.id),
  delegationId: text("delegation_id").notNull(),
  requestHash: text("request_hash").notNull(),
  state: text("state", { enum: ["running", "completed", "failed"] }).notNull(),
  executionId: text("execution_id").notNull(),
  leaseExpiresAt: integer("lease_expires_at").notNull(),
  result: text("result", { mode: "json" }).$type<{text:string;entries:Array<{id:string;revision:number}>}>(),
  error: text("error", { mode: "json" }).$type<{status:number;code:string;message:string;retryable:boolean}>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, table => [uniqueIndex("agent_owner_conversation_delegation").on(table.ownerId, table.conversationId, table.delegationId)]);
