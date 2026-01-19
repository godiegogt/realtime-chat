import express from "express";
import cors from "cors";
import "dotenv/config";

import { authRouter } from "./modules/auth/auth.routes";
import { prisma } from "./prisma";

const app = express();


app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  // ping real a DB
  await prisma.user.findMany({ take: 1 });
  res.json({ ok: true });
});


app.use("/auth", authRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
