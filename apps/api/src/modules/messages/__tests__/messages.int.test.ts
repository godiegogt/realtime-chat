import request from "supertest";
import express from "express";
import { authRouter } from "../../auth/auth.routes";
import { contactsRouter } from "../../contacts/contacts.routes";
import { conversationsRouter } from "../../conversations/conversations.routes";
import { messagesRouter } from "../messages.routes";
import { resetDb } from "../../../test-utils/db";
import { prisma } from "../../../prisma";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);
app.use("/contacts", contactsRouter);
app.use("/conversations", conversationsRouter);
app.use("/", messagesRouter);

async function login(email: string) {
  await request(app).post("/auth/register").send({ email, password: "123456" });
  const r = await request(app).post("/auth/login").send({ email, password: "123456" });
  return r.body.accessToken as string;
}

describe("Messages REST integration", () => {
  beforeEach(async () => {
    process.env.NODE_ENV = "test";
    await resetDb();
  });

  it("creates and lists messages for a conversation", async () => {
    const aToken = await login("a@mail.com");
    const bToken = await login("b@mail.com");

    // Crear contacto (A invita a B)
    await request(app)
      .post("/contacts/invite")
      .set("Authorization", `Bearer ${aToken}`)
      .send({ email: "b@mail.com" });

    // Obtener IDs por DB para estabilidad
    const a = await prisma.user.findUniqueOrThrow({ where: { email: "a@mail.com" } });
    const b = await prisma.user.findUniqueOrThrow({ where: { email: "b@mail.com" } });

    // Crear conversación
    const convRes = await request(app)
      .post("/conversations/direct")
      .set("Authorization", `Bearer ${aToken}`)
      .send({ otherUserId: b.id });

    const conversationId = convRes.body.id as string;

    // Post mensaje
    const m1 = await request(app)
      .post(`/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${aToken}`)
      .send({ body: "Hola B" });

    expect(m1.status).toBe(201);
    expect(m1.body.body).toBe("Hola B");

    // B también puede postear
    const m2 = await request(app)
      .post(`/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${bToken}`)
      .send({ body: "Hola A" });

    expect(m2.status).toBe(201);

    // Listar
    const list = await request(app)
      .get(`/conversations/${conversationId}/messages?limit=50`)
      .set("Authorization", `Bearer ${aToken}`);

    expect(list.status).toBe(200);
    expect(list.body.messages.length).toBe(2);
    expect(list.body.messages[0].body).toBe("Hola B");
    expect(list.body.messages[1].body).toBe("Hola A");
  });

  it("forbids posting if not participant", async () => {
    const aToken = await login("a@mail.com");
    const cToken = await login("c@mail.com");

    const a = await prisma.user.findUniqueOrThrow({ where: { email: "a@mail.com" } });
    const c = await prisma.user.findUniqueOrThrow({ where: { email: "c@mail.com" } });

    // Crear conversación A con sí mismo no se permite, entonces hacemos una conversación manual (fixture)
    const conv = await prisma.conversation.create({ data: { type: "DIRECT" } });
    await prisma.participant.createMany({
      data: [{ conversationId: conv.id, userId: a.id }],
    });

    const res = await request(app)
      .post(`/conversations/${conv.id}/messages`)
      .set("Authorization", `Bearer ${cToken}`)
      .send({ body: "no debería" });

    expect(res.status).toBe(403);
  });
});
