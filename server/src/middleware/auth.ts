import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId: string;
    userEmail: string;
    userName: string;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
