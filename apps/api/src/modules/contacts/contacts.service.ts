

import crypto from "crypto";
import { prisma } from "../../prisma";
import { hashPassword, verifyPassword } from "../../lib/password";
import { signAccessToken } from "../../lib/jwt";

async function createMutualContact(a: string, b: string) {
  // crea ambos lados (A->B y B->A), idempotente
  await prisma.$transaction([
    prisma.contact.upsert({
      where: { ownerId_contactId: { ownerId: a, contactId: b } },
      update: {},
      create: { ownerId: a, contactId: b },
    }),
    prisma.contact.upsert({
      where: { ownerId_contactId: { ownerId: b, contactId: a } },
      update: {},
      create: { ownerId: b, contactId: a },
    }),
  ]);
}

export async function inviteByEmail(inviterId: string, email: string) {
  const existing = await prisma.user.findUnique({ where: { email } });

  // Caso 1: ya existe → contacto directo
  if (existing) {
    if (existing.id === inviterId) throw new Error("CANNOT_INVITE_SELF");
    await createMutualContact(inviterId, existing.id);
    return { kind: "CONTACT_CREATED" as const, contact: { id: existing.id, email: existing.email } };
  }

  // Caso 2: no existe → crear invite con token seguro
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = await hashPassword(raw);

  const invite = await prisma.invite.create({
    data: {
      email,
      tokenHash,
      invitedById: inviterId,
    },
  });

  // Importante: no podés buscar por bcrypt hash, por eso enviamos "id.raw"
  return {
    kind: "INVITE_CREATED" as const,
    inviteToken: `${invite.id}.${raw}`,
  };
}

export async function listContacts(userId: string) {
  const contacts = await prisma.contact.findMany({
    where: { ownerId: userId },
    include: { contact: true },
    orderBy: { createdAt: "desc" },
  });

  // devolvemos info mínima
  return contacts.map((c) => ({
    id: c.contact.id,
    email: c.contact.email,
    createdAt: c.createdAt,
  }));
}

export async function acceptInvite(token: string, password: string) {
  const [inviteId, raw] = token.split(".");
  if (!inviteId || !raw) throw new Error("BAD_TOKEN_FORMAT");

  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite) throw new Error("INVITE_NOT_FOUND");
  if (invite.status !== "PENDING") throw new Error("INVITE_NOT_PENDING");

  const ok = await verifyPassword(raw, invite.tokenHash);
  if (!ok) throw new Error("INVITE_TOKEN_INVALID");

  // crear usuario + contactos + marcar invite
  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    // si el user ya existe, igual lo linkeamos y aceptamos la invite
    let user = await tx.user.findUnique({ where: { email: invite.email } });

    if (!user) {
      user = await tx.user.create({
        data: { email: invite.email, passwordHash },
      });
    }

    // contacto mutuo invitador <-> invitado
    await tx.contact.upsert({
      where: { ownerId_contactId: { ownerId: invite.invitedById, contactId: user.id } },
      update: {},
      create: { ownerId: invite.invitedById, contactId: user.id },
    });

    await tx.contact.upsert({
      where: { ownerId_contactId: { ownerId: user.id, contactId: invite.invitedById } },
      update: {},
      create: { ownerId: user.id, contactId: invite.invitedById },
    });

    await tx.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    return user;
  });

  // Para el MVP devolvemos accessToken; luego en Etapa 3 metemos refresh también acá
  const accessToken = signAccessToken({ sub: result.id });
  return { accessToken };
}

export async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user?.id ?? null;
}
