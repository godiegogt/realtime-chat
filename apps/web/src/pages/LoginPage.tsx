import { useState } from "react";
import * as authApi from "../api/auth.api";
import { useAuth } from "../auth/useAuth";

export function LoginPage({ onAuthed }: { onAuthed: () => void }) {
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState("a@mail.com");
  const [password, setPassword] = useState("123456");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const data =
        mode === "login"
          ? await authApi.login(email, password)
          : await authApi.register(email, password);

      loginWithToken(data.accessToken);
      onAuthed();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "FAILED");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", fontFamily: "system-ui" }}>
      <h2>Realtime Chat</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setMode("login")} disabled={mode === "login"}>Login</button>
        <button onClick={() => setMode("register")} disabled={mode === "register"}>Register</button>
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" />
        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}
