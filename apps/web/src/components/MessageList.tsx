import { useEffect, useRef, useState } from "react";
import type { MessageDto } from "../types/dto";

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function MessageList({ messages }: { messages: MessageDto[] }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [stickToBottom, setStickToBottom] = useState(true);

  function onScroll() {
    const el = boxRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setStickToBottom(distanceToBottom < 120);
  }

  useEffect(() => {
    if (!stickToBottom) return;
    const el = boxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, stickToBottom]);

  return (
    <div ref={boxRef} onScroll={onScroll} className="h-full overflow-auto p-4">
      {messages.length === 0 ? (
        <div className="grid h-full place-items-center text-sm text-white/50">
          No messages yet. Say hi 👋
        </div>
      ) : (
        <div className="grid gap-3">
          {messages.map((m) => {
            const mine = m.sender?.id === "me"; // luego lo conectamos a tu user real
            return (
              <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[75%] space-y-1">
                  <div
                    className={[
                      "rounded-2xl border px-3 py-2 text-sm leading-relaxed",
                      mine
                        ? "border-violet-500/30 bg-violet-600 text-white"
                        : "border-white/10 bg-white/5 text-white",
                    ].join(" ")}
                  >
                    {m.body}
                  </div>
                  <div className={mine ? "text-right text-xs text-white/50" : "text-xs text-white/50"}>
                    {!mine && <span className="mr-2">{m.sender?.email ?? "unknown"}</span>}
                    <span>{fmtTime(m.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
