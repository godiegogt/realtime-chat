import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import * as controller from "./contacts.controller";

export const contactsRouter = Router();

// protegido
contactsRouter.post("/invite", requireAuth, controller.invite);
contactsRouter.get("/", requireAuth, controller.list);

// público (el invitado aún no tiene auth)
contactsRouter.post("/invites/accept", controller.accept);
