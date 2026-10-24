import { getRequestListener, serve } from "@hono/node-server";
import { createApp } from "./app";
import { ENV } from "./env.server";
import { db } from "./services";
import { createServer, type Server } from "node:http";
import { attachDeviceAudio } from "./device/ingress";
import { createVoiceConversation, readVoiceConversation } from "./domain/journal";
import { DomainError } from "./domain/errors";
import { runJournalAgent } from "./voice/agent";
import { conversationInstructions } from "./voice/prompts";
import { deviceMessages } from "./voice/transcripts";

const app = createApp(db, ENV);
const server = process.env.VERCEL === "1" ? createServer(getRequestListener(app.fetch)) : serve({ fetch: app.fetch, port: ENV.PORT }, (info) => {
  console.log(`Pink Hack backend listening on http://localhost:${info.port}`);
});
const detachDevice = attachDeviceAudio(server as Server, db, {
  ...ENV, instructions: conversationInstructions,
  application: {
    startConversation: (store, ownerId, deviceId, operationId, entryId) => createVoiceConversation(store, ownerId, { source: "atech", device_id: deviceId, operation_id: operationId, ...(entryId ? { entry_id: entryId } : {}) }),
    readConversation: async (store, ownerId, deviceId, voiceSessionId) => {
      const conversation = await readVoiceConversation(store, ownerId, voiceSessionId);
      if (conversation.source !== "atech" || conversation.device_id !== deviceId) throw new DomainError(404, "not_found", "Device conversation was not found.");
      return conversation;
    },
    onDelegation: async ({ ownerId, voiceSessionId, delegationId, transcripts, signal }) => {
      signal.throwIfAborted();
      const result = await runJournalAgent(db, ENV, { ownerId, voiceSessionId, delegationId, messages: deviceMessages(transcripts) }, signal);
      signal.throwIfAborted();
      return result;
    },
  },
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void detachDevice().finally(() => server.close(() => { db.$client.close(); process.exit(0); }));
    setTimeout(() => process.exit(1), 15000).unref();
  });
}

export default server;
