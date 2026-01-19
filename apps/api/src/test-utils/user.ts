import { prisma } from "../prisma";
export async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.id ?? null;
}