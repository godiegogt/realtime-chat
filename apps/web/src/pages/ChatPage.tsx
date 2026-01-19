import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useSocket } from "../realtime/useSocket";
import * as convApi from "../api/conversations.api";
import * as msgApi from "../api/messages.api";
import type { ConversationListItem, MessageDto } from "../types/dto";
import { ConversationList } from "../components/ConversationList";
import { MessageList } from "../components/MessageList";
import { MessageComposer } from "../components/MessageComposer";
import * as contactsApi from "../api/contacts.api";
import { InviteForm } from "../components/InviteForm";
import { ContactsList } from "../components/ContactsList";

type ConvUI = ConversationListItem & { unread: number };
export function ChatPage() {
  const { logout } = useAuth();
  const { socket } = useSocket();
  const [contacts, setContacts] = useState<contactsApi.ContactDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ConvUI[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [typing, setTyping] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  async function refreshAll() {
    setError(null);
    setBusy(true);
    try {
      const [convs, conts] = await Promise.all([
        convApi.listConversations(),
        contactsApi.listContacts(),
      ]);
      setConversations((prev) => {
        const prevMap = new Map(prev.map((c) => [c.id, c.unread]));
        return convs.map((c) => ({ ...c, unread: prevMap.get(c.id) ?? 0 }));
      });
      setContacts(conts);
      if (!activeId && convs.length) setActiveId(convs[0].id);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "FAILED");
    } finally {
      setBusy(false);
    }
  }

  async function startDirectChat(contactId: string) {
    setError(null);
    try {
      const r = await convApi.createDirect(contactId);
      await refreshAll();
      setActiveId(r.id);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "FAILED");
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cargar mensajes desde DB cuando cambia conversación
  useEffect(() => {
    if (!activeId) return;

    (async () => {
      try {
        const data = await msgApi.listMessages(activeId);
        setMessages(data);
      } catch (e: any) {
        setError(e?.response?.data?.error ?? "FAILED_LOADING_MESSAGES");
      }
    })();
  }, [activeId]);

  // cargar mensajes cuando cambia conversación
  useEffect(() => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c))
    );
  }, [activeId]);

  // join room + realtime listener
  useEffect(() => {
    if (!socket || !activeId) return;

    socket.emit("conversation:join", activeId);

    const onNew = (msg: MessageDto) => {
      // 1) Sidebar: siempre actualiza lastMessage y unread
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== msg.conversationId) return c;

          const isActive = msg.conversationId === activeId;

          return {
            ...c,
            unread: isActive ? 0 : c.unread + 1,
            lastMessage: {
              id: msg.id,
              body: msg.body,
              createdAt: msg.createdAt,
            },
          };
        });

        // 2) (Opcional UX) mover conversación al top si tuvo actividad
        updated.sort((a, b) => {
          const ta = a.lastMessage?.createdAt ?? a.createdAt;
          const tb = b.lastMessage?.createdAt ?? b.createdAt;
          return new Date(tb).getTime() - new Date(ta).getTime();
        });

        return updated;
      });

      // 3) Chat actual: solo agrega si pertenece a la conversación activa
      if (msg.conversationId !== activeId) return;

      setMessages((prev) => {
        // reemplazo optimistic si existe
        const idx = prev.findIndex(
          (m) => m.id.startsWith("temp-") && m.body === msg.body
        );
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = msg;
          return copy;
        }

        // dedupe por id
        if (prev.some((m) => m.id === msg.id)) return prev;

        return [...prev, msg];
      });
    };


    const onTyping = (e: any) => {
      if (e.conversationId !== activeId) return;
      setTyping(Boolean(e.isTyping));
    };

    socket.on("message:new", onNew);
    socket.on("typing", onTyping);

    return () => {
      socket.off("message:new", onNew);
      socket.off("typing", onTyping);
    };
  }, [socket, activeId]);




  async function send(body: string) {
    if (!activeId) return;

    // optimistic
    const optimistic: MessageDto = {
      id: `temp-${crypto.randomUUID()}`,
      conversationId: activeId,
      body,
      createdAt: new Date().toISOString(),
      sender: { id: "me", email: "me" }, // luego lo mejoramos con tu email real
    };
    setMessages((prev) => [...prev, optimistic]);

    if (socket) {
      socket.emit("message:send", { conversationId: activeId, body });
      return;
    }

    const msg = await msgApi.postMessage(activeId, body);
    setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? msg : m)));
  }



  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "100vh", fontFamily: "system-ui", minHeight: 0 }}>
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
        {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
        {busy && <div style={{ marginTop: 8, fontSize: 12 }}>Loading...</div>}

        <InviteForm onChanged={refreshAll} />
        <ContactsList contacts={contacts} onStartChat={startDirectChat} />
      </aside>

      <main style={{
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        padding: 12,
        minHeight: 0,
      }}>
        <div style={{ marginBottom: 8 }}>
          <strong>{activeConversation?.others?.[0]?.email ?? "Select a conversation"}</strong>
        </div>
<div style={{ minHeight: 0 }}>
  <MessageList messages={messages} />
</div>
        
        {typing && <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Typing…</div>}
        <MessageComposer onSend={send} disabled={!activeId} />
      </main>
    </div>
  );
}
