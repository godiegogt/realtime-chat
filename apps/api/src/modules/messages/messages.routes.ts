import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import * as controller from "./messages.controller";

export const messagesRouter = Router();

messagesRouter.get("/conversations/:id/messages", requireAuth, controller.list);
messagesRouter.post("/conversations/:id/messages", requireAuth, controller.create);
