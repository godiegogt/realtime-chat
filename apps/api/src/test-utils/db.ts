import { prisma } from "../prisma";

export async function resetDb() {
  // orden por FK
  await prisma.message.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}
