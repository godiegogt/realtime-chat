import { Server } from "socket.io";
import http from "http";
import { verifyToken } from "./lib/jwt";
import { prisma } from "./prisma";
import * as messagesService from "./modules/messages/messages.service";

type JwtPayload = { sub: string };

export function initSocket(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // Auth middleware para Socket
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization?.toString().startsWith("Bearer ")
          ? socket.handshake.headers.authorization.toString().slice("Bearer ".length)
          : null);

      if (!token) return next(new Error("NO_TOKEN"));

      const payload = verifyToken<JwtPayload>(token);
      (socket as any).userId = payload.sub;
      next();
    } catch {
      next(new Error("INVALID_TOKEN"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId as string;

    socket.on("conversation:join", async (conversationId: string) => {
      // Validar que sea participante
      const part = await prisma.participant.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
      });
      if (!part) {
        socket.emit("error", { error: "FORBIDDEN" });
        return;
      }

      socket.join(`conversation:${conversationId}`);
      socket.emit("conversation:joined", { conversationId });
    });

    socket.on(
      "message:send",
      async (payload: { conversationId: string; body: string }) => {
        try {
          const msg = await messagesService.createMessage(
            userId,
            payload.conversationId,
            payload.body
          );

          io.to(`conversation:${payload.conversationId}`).emit("message:new", msg);
        } catch (e: any) {
          socket.emit("message:error", { error: e?.message ?? "FAILED" });
        }
      }
    );
  });

  return io;
}
