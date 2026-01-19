import type { MessageDto } from "../types/dto";

export function MessageList({ messages }: { messages: MessageDto[] }) {
  return (
    <div style={{ overflow: "auto", border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
      {messages.map((m) => (
        <div key={m.id} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {m.sender.email} — {new Date(m.createdAt).toLocaleTimeString()}
          </div>
          <div>{m.body}</div>
        </div>
      ))}
    </div>
  );
}
