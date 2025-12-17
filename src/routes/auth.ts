import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { otps, users } from "../db/schema";
import { sendOtpSms } from "../services/ippanel";
import { createSession } from "../services/auth";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/request-otp", async (req: Request, res: Response) => {
  const phone = String(req.body?.phone || "").trim();
  if (!/^\+?[\d\s-]{8,}$/.test(phone)) return res.status(422).json({ error: "شماره موبایل نامعتبر است" });
  const code = String(Math.floor(10000 + Math.random() * 90000));
  const expiresAt = new Date(Date.now() + 6 * 60 * 1000);
  await db.insert(otps).values({ phone, code, expiresAt, consumed: false });
  try {
    console.log("OTP request received", { phone });
    await sendOtpSms(phone, code);
    console.log("OTP SMS sent", { phone });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    try {
      console.error("OTP SMS failed", { phone, error: msg });
    } catch {}
    return res.status(502).json({ error: "ارسال پیامک ناموفق بود", details: msg });
  }
  res.json({ ok: true });
});

router.post("/verify-otp", async (req: Request, res: Response) => {
  const phone = String(req.body?.phone || "").trim();
  const code = String(req.body?.code || "").trim();
  if (!phone || !code) return res.status(422).json({ error: "ورودی نامعتبر" });
  const rows = await db.select().from(otps).where(eq(otps.phone, phone));
  const match = rows.reverse().find((r: any) => r.code === code && !r.consumed && new Date(r.expiresAt).getTime() > Date.now());
  if (!match) return res.status(401).json({ error: "کد تایید نامعتبر یا منقضی است" });
  await db.update(otps).set({ consumed: true }).where(eq(otps.id, (match as any).id));
  const existing = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  let userId = (existing[0] as any)?.id;
  if (!userId) {
    const inserted = await db.insert(users).values({ phone }).returning();
    userId = (inserted[0] as any).id;
  }
  const session = await createSession(userId!);
  res.json({ token: session.token });
});

export default router;
