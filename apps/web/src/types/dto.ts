export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type ConversationListItem = {
  id: string;
  type: "DIRECT" | "GROUP";
  others: { id: string; email: string }[];
  lastMessage: { id: string; body: string; createdAt: string } | null;
  createdAt: string;
};

export type MessageDto = {
  id: string;
  conversationId: string;
  body: string;
  createdAt: string;
  sender: { id: string; email: string };
};
