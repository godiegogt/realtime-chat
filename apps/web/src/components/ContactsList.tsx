import type { ContactDto } from "../api/contacts.api";
import { Button } from "./ui/Button";

export function ContactsList({
  contacts,
  onStartChat,
}: {
  contacts: ContactDto[];
  onStartChat: (contactId: string) => void;
}) {
  return (
    <div className="w-full space-y-3">
      <div className="text-sm font-extrabold tracking-tight">Contacts</div>

      {contacts.length === 0 ? (
        <div className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white/60">
          No contacts yet. Invite someone by email.
        </div>
      ) : (
        <div className="grid w-full gap-2">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition hover:bg-white/10"
            >
              <div className="flex w-full items-center justify-between gap-3">
                {/* 👇 Esto evita overflow dentro de flex */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{c.email}</div>
                  <div className="truncate text-xs text-white/60">
                    Start a direct chat
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => onStartChat(c.id)}
                  className="shrink-0"
                >
                  Chat
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
