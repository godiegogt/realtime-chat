import { prisma } from "../../prisma";

async function assertAreContacts(userId: string, otherUserId: string) {
  const rel = await prisma.contact.findUnique({
    where: { ownerId_contactId: { ownerId: userId, contactId: otherUserId } },
  });
  if (!rel) throw new Error("NOT_A_CONTACT");
}

export async function createOrGetDirectConversation(userId: string, otherUserId: string) {
  if (userId === otherUserId) throw new Error("CANNOT_CHAT_SELF");

  await assertAreContacts(userId, otherUserId);

  // 1) Buscar una conversación DIRECT donde estén ambos
  const existing = await prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
    include: {
      participants: { include: { user: true } },
    },
  });

  if (existing) {
    return {
      id: existing.id,
      type: existing.type,
      participants: existing.participants.map((p) => ({
        id: p.user.id,
        email: p.user.email,
      })),
      createdAt: existing.createdAt,
      existed: true as const,
    };
  }

  // 2) Crear en transacción
  const created = await prisma.$transaction(async (tx) => {
    const conv = await tx.conversation.create({
      data: { type: "DIRECT" },
    });

    await tx.participant.createMany({
      data: [
        { conversationId: conv.id, userId },
        { conversationId: conv.id, userId: otherUserId },
      ],
    });

    return conv;
  });

  // Re-lee con include
  const conv = await prisma.conversation.findUniqueOrThrow({
    where: { id: created.id },
    include: { participants: { include: { user: true } } },
  });

  return {
    id: conv.id,
    type: conv.type,
    participants: conv.participants.map((p) => ({
      id: p.user.id,
      email: p.user.email,
    })),
    createdAt: conv.createdAt,
    existed: false as const,
  };
}

export async function listMyConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      participants: { include: { user: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return conversations.map((c) => {
    const others = c.participants
      .filter((p) => p.userId !== userId)
      .map((p) => ({ id: p.user.id, email: p.user.email }));

    const last = c.messages[0];

    return {
      id: c.id,
      type: c.type,
      others,
      lastMessage: last
        ? { id: last.id, body: last.body, createdAt: last.createdAt }
        : null,
      createdAt: c.createdAt,
    };
  });
}

export async function getConversation(userId: string, conversationId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: { include: { user: true } } },
  });

  if (!conv) throw new Error("NOT_FOUND");

  const isMember = conv.participants.some((p) => p.userId === userId);
  if (!isMember) throw new Error("FORBIDDEN");

  return {
    id: conv.id,
    type: conv.type,
    participants: conv.participants.map((p) => ({
      id: p.user.id,
      email: p.user.email,
    })),
    createdAt: conv.createdAt,
  };
}
