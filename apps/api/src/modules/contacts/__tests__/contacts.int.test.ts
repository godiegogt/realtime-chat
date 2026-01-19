import request from "supertest";
import express from "express";

import { contactsRouter } from "../contacts.routes";
import { resetDb } from "../../../test-utils/db";
import { authRouter } from "../../auth/auth.routes";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);
app.use("/contacts", contactsRouter);

async function registerAndLogin(email: string) {
  await request(app).post("/auth/register").send({ email, password: "123456" });
  const login = await request(app).post("/auth/login").send({ email, password: "123456" });
  return login.body.accessToken as string;
}

describe("Contacts & Invites integration", () => {
  beforeEach(async () => {
    process.env.NODE_ENV = "test";
    await resetDb();
  });

  it("inviting an existing user creates mutual contact", async () => {
    const aToken = await registerAndLogin("a@mail.com");
    const _bToken = await registerAndLogin("b@mail.com");

    const invite = await request(app)
      .post("/contacts/invite")
      .set("Authorization", `Bearer ${aToken}`)
      .send({ email: "b@mail.com" });

    expect(invite.status).toBe(201);
    expect(invite.body.kind).toBe("CONTACT_CREATED");

    const listA = await request(app)
      .get("/contacts")
      .set("Authorization", `Bearer ${aToken}`);

    expect(listA.status).toBe(200);
    expect(listA.body.contacts.length).toBe(1);
    expect(listA.body.contacts[0].email).toBe("b@mail.com");
  });

  it("inviting a new email creates invite; accepting creates user + mutual contact", async () => {
    const aToken = await registerAndLogin("a@mail.com");

    const invite = await request(app)
      .post("/contacts/invite")
      .set("Authorization", `Bearer ${aToken}`)
      .send({ email: "new@mail.com" });

    expect(invite.status).toBe(201);
    expect(invite.body.kind).toBe("INVITE_CREATED");
    expect(invite.body.inviteToken).toBeDefined();

    const accept = await request(app)
      .post("/contacts/invites/accept")
      .send({ token: invite.body.inviteToken, password: "123456" });

    expect(accept.status).toBe(201);
    expect(accept.body.accessToken).toBeDefined();

    const listA = await request(app)
      .get("/contacts")
      .set("Authorization", `Bearer ${aToken}`);

    expect(listA.body.contacts.length).toBe(1);
    expect(listA.body.contacts[0].email).toBe("new@mail.com");
  });
});
