import type { ContactDto } from "../api/contacts.api";

export function ContactsList({
  contacts,
  onStartChat,
}: {
  contacts: ContactDto[];
  onStartChat: (contactId: string) => void;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Contacts</div>

      <div style={{ display: "grid", gap: 8 }}>
        {contacts.map((c) => (
          <button
            key={c.id}
            onClick={() => onStartChat(c.id)}
            style={{
              textAlign: "left",
              padding: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 600 }}>{c.email}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Start chat</div>
          </button>
        ))}
      </div>
    </div>
  );
}
