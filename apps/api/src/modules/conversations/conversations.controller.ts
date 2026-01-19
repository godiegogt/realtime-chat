import { Request, Response } from "express";
import * as service from "./conversations.service";
import { createDirectSchema } from "./conversations.schema";

export async function createDirect(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const { otherUserId } = createDirectSchema.parse(req.body);

  try {
    const result = await service.createOrGetDirectConversation(userId, otherUserId);
    res.status(result.existed ? 200 : 201).json(result);
  } catch (e: any) {
    const msg = e?.message ?? "FAILED";
    const status =
      msg === "NOT_A_CONTACT" ? 403 :
      msg === "CANNOT_CHAT_SELF" ? 400 :
      400;
    res.status(status).json({ error: msg });
  }
}

export async function list(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const data = await service.listMyConversations(userId);
  res.json({ conversations: data });
}

export async function getOne(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const conversationId = req.params.id as string;

  try {
    const data = await service.getConversation(userId, conversationId);
    res.json(data);
  } catch (e: any) {
    const msg = e?.message ?? "FAILED";
    const status =
      msg === "NOT_FOUND" ? 404 :
      msg === "FORBIDDEN" ? 403 :
      400;
    res.status(status).json({ error: msg });
  }
}
