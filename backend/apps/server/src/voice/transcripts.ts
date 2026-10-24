import { DomainError } from "../domain/errors";

export function deviceMessages(fragments: readonly { role: "user" | "assistant"; text: string }[]) {
  const messages: { role: "user" | "assistant"; content: string }[] = [];
  let total = 0;
  for (const fragment of fragments) {
    total += fragment.text.length;
    if (total > 24000) throw new DomainError(422, "transcript_limit", "Conversation exceeds the agent context bound.");
    const previous = messages.at(-1);
    if (previous?.role === fragment.role) previous.content += fragment.text;
    else messages.push({ role: fragment.role, content: fragment.text });
  }
  if (messages.length > 24 || messages.some((message) => message.content.length > 2000)) {
    throw new DomainError(422, "transcript_limit", "Conversation exceeds the agent message bound.");
  }
  return messages.filter((message) => message.content.trim().length > 0);
}
