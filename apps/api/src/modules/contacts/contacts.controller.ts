import { Request, Response } from "express";
import { inviteSchema, acceptInviteSchema } from "./contacts.schema";
import * as service from "./contacts.service";

export async function invite(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const { email } = inviteSchema.parse(req.body);

  try {
    const result = await service.inviteByEmail(userId, email);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "INVITE_FAILED" });
  }
}

export async function list(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const contacts = await service.listContacts(userId);
  res.json({ contacts });
}

export async function accept(req: Request, res: Response) {
  const { token, password } = acceptInviteSchema.parse(req.body);

  try {
    const result = await service.acceptInvite(token, password);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "ACCEPT_FAILED" });
  }
}
