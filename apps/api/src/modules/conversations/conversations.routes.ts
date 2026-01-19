import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import * as controller from "./conversations.controller";

export const conversationsRouter = Router();

conversationsRouter.post("/direct", requireAuth, controller.createDirect);
conversationsRouter.get("/", requireAuth, controller.list);
conversationsRouter.get("/:id", requireAuth, controller.getOne);
