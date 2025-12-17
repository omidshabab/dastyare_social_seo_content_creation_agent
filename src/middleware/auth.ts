import { Request, Response, NextFunction } from "express";
import { getSession } from "../services/auth";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  let token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token && typeof req.query.token === "string") token = String(req.query.token);
  if (!token) return res.status(401).json({ error: "توکن نامعتبر است" });
  const s = await getSession(token);
  if (!s) return res.status(401).json({ error: "توکن نامعتبر است" });
  (req as any).userId = (s as any).userId;
  next();
}
