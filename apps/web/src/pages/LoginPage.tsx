import { useState } from "react";
import * as authApi from "../api/auth.api";
import { useAuth } from "../auth/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

export function LoginPage({ onAuthed }: { onAuthed: () => void }) {
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState("a@mail.com");
  const [password, setPassword] = useState("123456");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data =
        mode === "login"
          ? await authApi.login(email, password)
          : await authApi.register(email, password);

      loginWithToken(data.accessToken);
      onAuthed();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "FAILED");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <Card className="w-full p-6">
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Realtime Chat</h1>
              <p className="text-sm text-white/60">Sign in to continue</p>
            </div>

            <div className="flex w-full rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={[
                  "flex-1 rounded-full px-3 py-2 text-sm font-bold transition",
                  mode === "login"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white",
                ].join(" ")}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={[
                  "flex-1 rounded-full px-3 py-2 text-sm font-bold transition",
                  mode === "register"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white",
                ].join(" ")}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoComplete="email"
              />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />

              <Button variant="primary" type="submit" disabled={busy} className="w-full">
                {busy ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
              </Button>
            </form>

            <p className="text-xs text-white/50">
              Tip: después quitamos credenciales por defecto + validación con Zod.
            </p>
          </div>
        </Card>
      </div>

    </div>
  );
}
