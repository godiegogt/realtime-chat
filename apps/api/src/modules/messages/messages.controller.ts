import { Request, Response } from "express";
import * as service from "./messages.service";
import { createMessageSchema } from "./messages.schema";

export async function list(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const conversationId = req.params.id as string;
  const limit = req.query.limit ? Number(req.query.limit) : 50;

  try {
    const messages = await service.listMessages(userId, conversationId, limit);
    res.json({ messages });
  } catch (e: any) {
    const msg = e?.message ?? "FAILED";
    const status = msg === "FORBIDDEN" ? 403 : 400;
    res.status(status).json({ error: msg });
  }
}

export async function create(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const conversationId = req.params.id as string;
  const { body } = createMessageSchema.parse(req.body);

  try {
    const message = await service.createMessage(userId, conversationId, body);
    res.status(201).json(message);
  } catch (e: any) {
    const msg = e?.message ?? "FAILED";
    const status = msg === "FORBIDDEN" ? 403 : 400;
    res.status(status).json({ error: msg });
  }
}
