import { useEffect, useRef, useState } from "react";
import type { MessageDto } from "../types/dto";

export function MessageList({ messages }: { messages: MessageDto[] }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [stickToBottom, setStickToBottom] = useState(true);

  // Si el usuario scrollea hacia arriba, ya no lo forzamos
  function onScroll() {
    const el = boxRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setStickToBottom(distanceToBottom < 80); // threshold
  }

  useEffect(() => {
    if (!stickToBottom) return;
    const el = boxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, stickToBottom]);

  return (
    <div
      ref={boxRef}
      onScroll={onScroll}
      style={{
        overflow: "auto",
        border: "1px solid #ddd",
        padding: 12,
        marginBottom: 8,
        height: "100%",
        minHeight: 0,
      }}
    >
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
