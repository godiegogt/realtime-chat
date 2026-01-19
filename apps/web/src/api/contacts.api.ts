import { http } from "./http";

export type ContactDto = { id: string; email: string };

export type InviteResult =
  | { kind: "CONTACT_CREATED"; contact: ContactDto }
  | { kind: "INVITE_CREATED"; email: string; inviteToken: string };

export async function listContacts() {
  const r = await http.get<{ contacts: ContactDto[] }>("/contacts");
  return r.data.contacts;
}

export async function inviteByEmail(email: string) {
  const r = await http.post<InviteResult>("/contacts/invite", { email });
  return r.data;
}