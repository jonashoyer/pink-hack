import { createHash } from "node:crypto";
import { agentDelegations } from "@backend/db/schema/voice";
import { and, eq, gt, sql } from "drizzle-orm";
import type { Store } from "./store";
import { DomainError } from "./errors";
export const agentDatabaseNow = sql`cast((julianday('now') - 2440587.5) * 86400000 as integer)`;
export type AgentExecution = { delegationId: string; executionId: string; mutationIndex: number; signal?: AbortSignal };
export function agentMutationId(ownerId: string, conversationId: string, delegationId: string, index: number) {
  return createHash("sha256").update(JSON.stringify(["journal-agent-action", ownerId, conversationId, delegationId, index])).digest("hex");
}
export async function assertAgentExecution(tx: Store, ownerId: string, conversationId: string, execution?: AgentExecution) {
  if (!execution) return;
  const [current] = await tx.select({ id: agentDelegations.id }).from(agentDelegations).where(and(
    eq(agentDelegations.ownerId, ownerId), eq(agentDelegations.conversationId, conversationId), eq(agentDelegations.delegationId, execution.delegationId),
    eq(agentDelegations.executionId, execution.executionId), eq(agentDelegations.state, "running"), gt(agentDelegations.leaseExpiresAt, agentDatabaseNow),
  ));
  if (!current) throw new DomainError(409, "assistant_execution_expired", "This assistant callback no longer has writing permission.");
}
