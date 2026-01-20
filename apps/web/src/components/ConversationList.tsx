import type { ConversationListItem } from "../types/dto";
import { Badge } from "./ui/Badge";

type ConvUI = ConversationListItem & { unread: number };

function fmt(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

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
    <div className="grid gap-2">
      {conversations.map((c) => {
        const title = c.others[0]?.email ?? c.id;
        const isActive = c.id === activeId;
        const time = fmt(c.lastMessage?.createdAt);
        const preview = c.lastMessage?.body ?? "No messages yet";

        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={[
              "relative w-full rounded-2xl border px-3 py-3 text-left transition",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/40",
              isActive
                ? "border-violet-500/40 bg-violet-500/10"
                : "border-white/10 bg-white/5 hover:bg-white/10",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="font-extrabold tracking-tight">{title}</div>
              <div className="text-xs text-white/50">{time}</div>
            </div>

            <div className="mt-1 truncate text-xs text-white/60" title={preview}>
              {preview}
            </div>

            {c.unread > 0 && !isActive && (
              <div className="absolute right-3 top-3">
                <Badge variant="danger">{c.unread}</Badge>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
