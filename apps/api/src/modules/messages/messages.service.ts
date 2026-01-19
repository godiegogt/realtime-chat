import { prisma } from "../../prisma";

async function assertParticipant(userId: string, conversationId: string) {
  const participant = await prisma.participant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) throw new Error("FORBIDDEN");
}

export async function listMessages(userId: string, conversationId: string, limit = 50) {
  await assertParticipant(userId, conversationId);

  const msgs = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { sender: true },
  });

  // devolver en orden cronológico ascendente para UI
  return msgs
    .map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      body: m.body,
      createdAt: m.createdAt,
      sender: { id: m.sender.id, email: m.sender.email },
    }))
    .reverse();
}

export async function createMessage(userId: string, conversationId: string, body: string) {
  await assertParticipant(userId, conversationId);

  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      body,
    },
    include: { sender: true },
  });

  return {
    id: msg.id,
    conversationId: msg.conversationId,
    body: msg.body,
    createdAt: msg.createdAt,
    sender: { id: msg.sender.id, email: msg.sender.email },
  };
}
