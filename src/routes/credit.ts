import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const row = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const u = row[0] as any;
  res.json({ credits: u?.credits || 0 });
});

router.post("/charge", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const amount = Number(req.body?.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(422).json({ error: "مبلغ نامعتبر است" });
  const row = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const current = (row[0] as any)?.credits || 0;
  const next = current + amount;
  await db.update(users).set({ credits: next }).where(eq(users.id, userId));
  res.json({ credits: next });
});

export default router;
