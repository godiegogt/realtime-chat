import { useState } from "react";
import { Button } from "./ui/Button";

export function MessageComposer({
  onSend,
  disabled,
}: {
  onSend: (body: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        disabled={disabled}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-60"
      />
      <Button variant="primary" disabled={disabled} type="button" onClick={submit}>
        Send
      </Button>
    </div>
  );
}
