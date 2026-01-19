import type { ConversationListItem } from "../types/dto";

type ConvUI = ConversationListItem & { unread: number };

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: ConvUI[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
      {conversations.map((c) => {
        const title = c.others[0]?.email ?? c.id;
        const isActive = c.id === activeId;

        const time = c.lastMessage?.createdAt
          ? new Date(c.lastMessage.createdAt).toLocaleTimeString()
          : "";

        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              textAlign: "left",
              padding: 10,
              border: "1px solid #ddd",
              background: isActive ? "#f2f2f2" : "white",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{time}</div>
            </div>

            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
              {c.lastMessage?.body ?? "No messages yet"}
            </div>

            {c.unread > 0 && !isActive && (
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 999,
                  background: "crimson",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  padding: "0 6px",
                }}
              >
                {c.unread}
              </div>
            )}
            {/* Último mensaje */}
            {/* <div style={{ fontSize: 12, opacity: 0.7 }}>
              {c.lastMessage?.body ?? "No messages yet"}
            </div> */}

            {/* 🔴 BADGE DE UNREAD */}
            {c.unread > 0 && !isActive &&  (
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  minWidth: 20,
                  height: 20,
                  padding: "0 6px",
                  borderRadius: 999,
                  background: "crimson",
                  color: "white",
                  fontSize: 12,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {c.unread}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
