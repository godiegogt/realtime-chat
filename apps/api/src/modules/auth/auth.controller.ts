import { Request, Response } from "express";
import * as service from "./auth.service";
import { authSchema } from "./auth.schema";

export async function register(req: Request, res: Response) {
  const data = authSchema.parse(req.body);
  const tokens = await service.register(data.email, data.password);
  res.status(201).json(tokens);
}

export async function login(req: Request, res: Response) {
  const data = authSchema.parse(req.body);
  const tokens = await service.login(data.email, data.password);
  res.json(tokens);
}
