import { http } from "./http";
import type { MessageDto } from "../types/dto";

export async function listMessages(conversationId: string) {
  const r = await http.get<{ messages: MessageDto[] }>(
    `/conversations/${conversationId}/messages?limit=50`
  );
  return r.data.messages;
}

export async function postMessage(conversationId: string, body: string) {
  const r = await http.post<MessageDto>(`/conversations/${conversationId}/messages`, { body });
  return r.data;
}
