import React, { createContext, useEffect, useMemo, useState } from "react";
import { setAuthToken } from "../api/http";

type AuthState = {
  token: string | null;
  loginWithToken: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setToken(saved);
      setAuthToken(saved);
    }
  }, []);

  const value = useMemo<AuthState>(() => ({
    token,
    loginWithToken: (t) => {
      setToken(t);
      localStorage.setItem(STORAGE_KEY, t);
      setAuthToken(t);
    },
    logout: () => {
      setToken(null);
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
    },
  }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
