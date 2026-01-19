import type { ConversationListItem } from "../types/dto";

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: ConversationListItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
      {conversations.map((c) => {
        const title = c.others[0]?.email ?? c.id;
        const isActive = c.id === activeId;

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
            }}
          >
            <div style={{ fontWeight: 600 }}>{title}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {c.lastMessage?.body ?? "No messages yet"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
