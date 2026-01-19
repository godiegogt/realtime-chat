import { http } from "./http";
import type { AuthTokens } from "../types/dto";

export async function register(email: string, password: string) {
  const r = await http.post<AuthTokens>("/auth/register", { email, password });
  return r.data;
}

export async function login(email: string, password: string) {
  const r = await http.post<AuthTokens>("/auth/login", { email, password });
  return r.data;
}
