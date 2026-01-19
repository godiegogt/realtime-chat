import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useSocket } from "../realtime/useSocket";
import * as convApi from "../api/conversations.api";
import * as msgApi from "../api/messages.api";
import type { ConversationListItem, MessageDto } from "../types/dto";
import { ConversationList } from "../components/ConversationList";
import { MessageList } from "../components/MessageList";
import { MessageComposer } from "../components/MessageComposer";

export function ChatPage() {
  const { logout } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  async function refreshConversations() {
    const data = await convApi.listConversations();
    setConversations(data);
    if (!activeId && data.length) setActiveId(data[0].id);
  }

  useEffect(() => {
    refreshConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cargar mensajes cuando cambia conversación
  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const data = await msgApi.listMessages(activeId);
      setMessages(data);
    })();
  }, [activeId]);

  // join room + realtime listener
  useEffect(() => {
    if (!socket || !activeId) return;

    socket.emit("conversation:join", activeId);

    const onNew = (msg: MessageDto) => {
      if (msg.conversationId !== activeId) return;
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
    };
  }, [socket, activeId]);

  async function send(body: string) {
    if (!activeId) return;

    // preferimos mandar por socket para realtime + persistencia server-side
    if (socket) {
      socket.emit("message:send", { conversationId: activeId, body });
      return;
    }

    // fallback REST
    const msg = await msgApi.postMessage(activeId, body);
    setMessages((prev) => [...prev, msg]);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "100vh", fontFamily: "system-ui" }}>
      <aside style={{ borderRight: "1px solid #ddd", padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>Conversations</strong>
          <button onClick={logout}>Logout</button>
        </div>

        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </aside>

      <main style={{ display: "grid", gridTemplateRows: "1fr auto", padding: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>{activeConversation?.others?.[0]?.email ?? "Select a conversation"}</strong>
        </div>

        <MessageList messages={messages} />
        <MessageComposer onSend={send} disabled={!activeId} />
      </main>
    </div>
  );
}
