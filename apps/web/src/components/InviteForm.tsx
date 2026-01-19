import { useState } from "react";
import * as contactsApi from "../api/contacts.api";

export function InviteForm({ onChanged }: { onChanged: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setBusy(true);
    setMsg(null);

    try {
      const res = await contactsApi.inviteByEmail(trimmed);

      if (res.kind === "CONTACT_CREATED") {
        setMsg(`✅ Contacto agregado: ${res.contact.email}`);
      } else {
        setMsg(`📩 Invitación creada para: ${res.email} (token: ${res.inviteToken})`);
      }

      setEmail("");
      onChanged();
    } catch (err: any) {
      setMsg(err?.response?.data?.error ?? "FAILED");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 12, borderTop: "1px solid #ddd", paddingTop: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Invite by email</div>

      <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@mail.com"
          style={{ flex: 1, padding: 10, border: "1px solid #ddd" }}
          disabled={busy}
        />
        <button type="submit" disabled={busy}>Invite</button>
      </form>

      {msg && <div style={{ marginTop: 8, fontSize: 12 }}>{msg}</div>}
    </div>
  );
}
