import { randomUUID, createHash } from "node:crypto";
import type { Database } from "@backend/db";
import { agentDelegations } from "@backend/db/schema/voice";
import { journalDocuments, operationReceipts, voiceConversations } from "@backend/db/schema/journal";
import { and, eq, inArray, lte, sql } from "drizzle-orm";
import { agentDatabaseNow, agentMutationId } from "../domain/agent-execution";
import { readVoiceConversation } from "../domain/journal";
import { DomainError } from "../domain/errors";
import { write, fingerprint, now, type Store } from "../domain/store";
export type DelegationResult = { text: string; entries: Array<{id:string;revision:number}> };
type Input = {ownerId:string;voiceSessionId:string;delegationId:string;entryId?:string;messages:unknown};
const key = (input: Input) => createHash("sha256").update(JSON.stringify([input.ownerId,input.voiceSessionId,input.delegationId])).digest("hex");
const leaseMs = 60_000; // Longer than the bounded 45-second provider workflow.
async function recovered(tx: Store, input: Input): Promise<DelegationResult | null> {
  const ids = Array.from({length:12},(_,i)=>agentMutationId(input.ownerId,input.voiceSessionId,input.delegationId,i));
  const receipts = await tx.select({ result: operationReceipts.result }).from(operationReceipts).where(and(eq(operationReceipts.owner_id,input.ownerId),inArray(operationReceipts.operation_id,ids)));
  if (!receipts.length) return null;
  const entryIds = [...new Set(receipts.map(x => (x.result as {id:string}).id))];
  const rows = await tx.select({id:journalDocuments.id,revision:journalDocuments.revision}).from(journalDocuments).where(and(eq(journalDocuments.owner_id,input.ownerId),inArray(journalDocuments.id,entryIds)));
  if (rows.length !== entryIds.length) throw new DomainError(409,"callback_result_missing","A saved callback result is no longer available. No writing was repeated.");
  return {text:rows.length===1?"Your journal entry is saved.":"Your journal entries are saved.",entries:rows};
}
export async function claimDelegation(db: Database, input: Input): Promise<{result:DelegationResult}|{executionId:string}> {
  await readVoiceConversation(db,input.ownerId,input.voiceSessionId);
  const requestHash=fingerprint({messages:input.messages,entry_id:input.entryId});
  return write(db,async tx=>{
    const [conversation]=await tx.select({state:voiceConversations.state}).from(voiceConversations).where(and(eq(voiceConversations.id,input.voiceSessionId),eq(voiceConversations.owner_id,input.ownerId)));
    if(conversation?.state!=="active")throw new DomainError(409,"conversation_stopped","This conversation is stopped. Start a new conversation before writing.");
    const [prior]=await tx.select().from(agentDelegations).where(eq(agentDelegations.id,key(input)));
    if(prior){
      if(prior.requestHash!==requestHash)throw new DomainError(409,"delegation_conflict","This delegation ID was reused with different messages or target.");
      if(prior.state==="completed"&&prior.result)return {result:prior.result};
      if(prior.state==="failed"&&prior.error)throw new DomainError(prior.error.status,prior.error.code,prior.error.message,prior.error.retryable);
      const [expired]=await tx.select({id:agentDelegations.id}).from(agentDelegations).where(and(eq(agentDelegations.id,prior.id),lte(agentDelegations.leaseExpiresAt,agentDatabaseNow)));
      if(!expired)throw new DomainError(409,"assistant_in_progress","This delegation is already running. Retry the same request after it finishes.",true);
      const result=await recovered(tx,input);
      if(result){await tx.update(agentDelegations).set({state:"completed",result,updatedAt:now()}).where(eq(agentDelegations.id,prior.id));return {result};}
    }
    const executionId=randomUUID();const timestamp=now();
    if(prior)await tx.update(agentDelegations).set({executionId,leaseExpiresAt:sql`${agentDatabaseNow}+${leaseMs}`,updatedAt:timestamp}).where(eq(agentDelegations.id,prior.id));
    else await tx.insert(agentDelegations).values({id:key(input),ownerId:input.ownerId,conversationId:input.voiceSessionId,delegationId:input.delegationId,requestHash,state:"running",executionId,leaseExpiresAt:sql`${agentDatabaseNow}+${leaseMs}`,createdAt:timestamp,updatedAt:timestamp});
    return {executionId};
  });
}
export async function finishDelegation(db: Database,input:Input,executionId:string,result?:DelegationResult,error?:DomainError):Promise<DelegationResult|null>{
  return write(db,async tx=>{
    const [current]=await tx.select().from(agentDelegations).where(and(eq(agentDelegations.id,key(input)),eq(agentDelegations.executionId,executionId)));
    if(!current)throw new DomainError(409,"assistant_execution_expired","This callback execution was replaced.");
    const output=result??await recovered(tx,input);
    await tx.update(agentDelegations).set(output?{state:"completed",result:output,error:null,updatedAt:now()}:{state:"failed",error:{status:error?.status??502,code:error?.code??"assistant_unavailable",message:error?.message??"The assistant could not finish.",retryable:error?.retryable??true},updatedAt:now()}).where(and(eq(agentDelegations.id,current.id),eq(agentDelegations.executionId,executionId)));
    return output;
  });
}
const active = new WeakMap<Database,Map<string,Set<AbortController>>>();
export function registerAgent(db:Database,ownerId:string,conversationId:string,controller:AbortController){
  let groups=active.get(db);if(!groups){groups=new Map();active.set(db,groups);}const id=JSON.stringify([ownerId,conversationId]);const group=groups.get(id)??new Set();group.add(controller);groups.set(id,group);
  return()=>{group.delete(controller);if(!group.size)groups!.delete(id);};
}
export function abortConversationAgents(db:Database,ownerId:string,conversationId:string){for(const controller of active.get(db)?.get(JSON.stringify([ownerId,conversationId]))??[])controller.abort();}
