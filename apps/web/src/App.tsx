import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { ChatPage } from "./pages/ChatPage";
import { useAuth } from "./auth/useAuth";

export default function App() {
  const { token } = useAuth();
  const [forced, setForced] = useState(0);

  if (!token) return <LoginPage onAuthed={() => setForced((x) => x + 1)} />;
  return <ChatPage key={forced} />;
}
