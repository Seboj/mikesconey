import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "../db/index.js";
import { adminUsers } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password format" });
    return;
  }

  const { email, password } = parsed.data;

  const users = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (users.length === 0) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const user = users[0];
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = user.id;
  req.session.userEmail = user.email;
  req.session.userName = user.name;

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to logout" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

authRouter.get("/me", (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    id: req.session.userId,
    email: req.session.userEmail,
    name: req.session.userName,
  });
});
