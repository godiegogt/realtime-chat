import { useState } from "react";

export function MessageComposer({
  onSend,
  disabled,
}: {
  onSend: (body: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setText("");
      }}
      style={{ display: "flex", gap: 8 }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        style={{ flex: 1, padding: 10, border: "1px solid #ddd" }}
      />
      <button type="submit" disabled={disabled}>Send</button>
    </form>
  );
}
