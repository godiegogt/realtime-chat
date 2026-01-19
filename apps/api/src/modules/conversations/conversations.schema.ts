import { z } from "zod";

export const createDirectSchema = z.object({
  otherUserId: z.string().min(5),
});
