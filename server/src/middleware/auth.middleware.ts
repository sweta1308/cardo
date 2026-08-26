import "dotenv/config";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const JWT_SECRET = process.env["JWT_SECRET"]!;

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.token as string;

  if (!token) {
    res.status(403).json({ message: "You are not logged in" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    if (!userId) {
      res.status(403).json({ message: "malformed token" });
      return;
    }

    req.userId = userId;
    next();
  } catch {
    res.status(403).json({ message: "malformed token" });
  }
}
