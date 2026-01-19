
import { hashPassword, verifyPassword } from "../../lib/password";
import { signAccessToken, signRefreshToken } from "../../lib/jwt";
import crypto from "crypto";
import { prisma } from "../../prisma";


export async function register(email: string, password: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("EMAIL_EXISTS");

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash }
  });

  return issueTokens(user.id);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  return issueTokens(user.id);
}

async function issueTokens(userId: string) {
  const accessToken = signAccessToken({ sub: userId });

  const refreshRaw = crypto.randomBytes(40).toString("hex");
  const refreshHash = await hashPassword(refreshRaw);

  await prisma.refreshToken.create({
    data: { tokenHash: refreshHash, userId }
  });

  return {
    accessToken,
    refreshToken: refreshRaw
  };
}
