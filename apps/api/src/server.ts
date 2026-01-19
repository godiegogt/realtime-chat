import http from "http";
import express from "express";
import cors from "cors";
import "dotenv/config";
import { initSocket } from "./socket";
import { authRouter } from "./modules/auth/auth.routes";
import { prisma } from "./prisma";
import { conversationsRouter } from "./modules/conversations/conversations.routes";
import { contactsRouter } from "./modules/contacts/contacts.routes";
import { messagesRouter } from "./modules/messages/messages.routes";

const app = express();


app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  // ping real a DB
  await prisma.user.findMany({ take: 1 });
  res.json({ ok: true });
});


app.use("/auth", authRouter);
app.use("/contacts", contactsRouter);
app.use("/conversations", conversationsRouter);
app.use("/", messagesRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});