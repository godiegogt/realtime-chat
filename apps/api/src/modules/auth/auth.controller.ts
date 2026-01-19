import { Request, Response } from "express";
import * as service from "./auth.service";
import { authSchema } from "./auth.schema";

export async function register(req: Request, res: Response) {
  try {
    const data = authSchema.parse(req.body);
    const tokens = await service.register(data.email, data.password);
    return res.status(201).json(tokens);
  } catch (e: any) {
    // clave: devolver el mensaje para ver qué está pasando en tests
    const msg = e?.message ?? "REGISTER_FAILED";
    const status = msg === "EMAIL_EXISTS" ? 409 : 400;
    return res.status(status).json({ error: msg });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = authSchema.parse(req.body);
    const tokens = await service.login(data.email, data.password);
    return res.json(tokens);
  } catch (e: any) {
    const msg = e?.message ?? "LOGIN_FAILED";
    const status = msg === "INVALID_CREDENTIALS" ? 401 : 400;
    return res.status(status).json({ error: msg });
  }
}
