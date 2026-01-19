import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

type JwtPayload = { sub: string };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "NO_TOKEN" });

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyToken<JwtPayload>(token);
    (req as any).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}
