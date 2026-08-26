import bcrypt from "bcrypt";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const authRouter = express.Router();

interface SignupBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env["JWT_SECRET"]!;

function signToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

authRouter.post("/signup", async (req: Request<{}, {}, SignupBody>, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true },
  });

  res.status(201).json({ user, token: signToken(user.id) });
});

authRouter.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token: signToken(user.id),
  });
});

authRouter.post("/logout", authMiddleware, (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});