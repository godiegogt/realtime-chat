import { http } from "./http";
import type { ConversationListItem } from "../types/dto";

export async function listConversations() {
  const r = await http.get<{ conversations: ConversationListItem[] }>("/conversations");
  return r.data.conversations;
}

export async function createDirect(otherUserId: string) {
  const r = await http.post("/conversations/direct", { otherUserId });
  return r.data as { id: string };
}
