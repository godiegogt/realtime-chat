import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().email(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6),
});
