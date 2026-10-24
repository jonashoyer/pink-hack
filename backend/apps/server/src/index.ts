import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { ENV } from "./env.server";
import { auth, db } from "./services";
import type { Server } from "node:http";
import { attachDeviceAudio } from "./device/ingress";
import { commitCheckin, createDeviceCheckin, getCheckin } from "./domain/journal";
import { DomainError } from "./domain/errors";
import { runJournalAgent } from "./voice/agent";
import { conversationInstructions } from "./voice/prompts";
import { deviceMessages } from "./voice/transcripts";

const app = createApp(db, auth, ENV);
const server = serve({ fetch: app.fetch, port: ENV.PORT }, (info) => {
  console.log(`Pink Hack backend listening on http://localhost:${info.port}`);
});
const detachDevice = attachDeviceAudio(server as Server, db, {
  ...ENV, instructions: conversationInstructions,
  application: {
    startCheckin: (store, ownerId, deviceId, operationId) => createDeviceCheckin(store, ownerId, deviceId, { operation_id: operationId }),
    loadCheckin: async (store, ownerId, deviceId, checkinId) => {
      const checkin = await getCheckin(store, ownerId, checkinId);
      if (checkin.source !== "atech" || checkin.device_id !== deviceId) throw new DomainError(404, "not_found", "Device check-in was not found.");
      return checkin;
    },
    onDelegation: async ({ ownerId, checkinId, transcripts, signal }) => {
      signal.throwIfAborted();
      const result = await runJournalAgent(db, ENV, { ownerId, checkinId, messages: deviceMessages(transcripts) }, signal);
      signal.throwIfAborted();
      const reviewing = result.stage === "draft" || result.stage === "awaiting_confirmation";
      return { commentary: `${result.text.slice(0, 350)}${reviewing ? " To confirm, say save this journal." : ""}`, ...(reviewing ? { reviewRevision: result.draft_revision } : {}) };
    },
    onConfirmed: async ({ ownerId, checkinId, receipt, operationId, signal }) => {
      signal.throwIfAborted();
      const entry = await commitCheckin(db, ownerId, checkinId, { confirmation_receipt: receipt, operation_id: operationId });
      return { entry_id: entry.id, revision: entry.revision };
    },
  },
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void detachDevice().finally(() => server.close(() => { db.$client.close(); process.exit(0); }));
    setTimeout(() => process.exit(1), 15000).unref();
  });
}
