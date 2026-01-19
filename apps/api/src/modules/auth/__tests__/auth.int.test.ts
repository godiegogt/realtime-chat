import request from "supertest";
import express from "express";
import { authRouter } from "../auth.routes";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("Auth integration", () => {
  it("registers and logs in", async () => {
    const email = `test${Date.now()}@mail.com`;

    const register = await request(app)
      .post("/auth/register")
      .send({ email, password: "123456" });

    expect(register.status).toBe(201);
    expect(register.body.accessToken).toBeDefined();

    const login = await request(app)
      .post("/auth/login")
      .send({ email, password: "123456" });

    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeDefined();
  });
});
