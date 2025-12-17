import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { env } from "../env";
import { initSse, sseSend, sseClose } from "../utils/sse";
import OpenAI from "openai";

const router = Router();

router.get("/stream", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const topic = String(req.query?.topic || "");
  const keywords = String(req.query?.keywords || "");
  const tone = String(req.query?.tone || "رسمی");
  const needFaq = String(req.query?.faq || "yes") === "yes";
  const row = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const credits = (row[0] as any)?.credits || 0;
  if (credits < env.contentCost) {
    return res.status(402).json({ error: "اعتبار کافی نیست. لطفاً شارژ کنید." });
  }
  await db.update(users).set({ credits: credits - env.contentCost }).where(eq(users.id, userId));
  initSse(res);
  const client = new OpenAI({ apiKey: env.openaiApiKey });
  await streamPiece(client, res, "title", `عنوان مقاله‌ای درباره ${topic} با کلمات کلیدی ${keywords} و لحن ${tone}، فارسی و جذاب تولید کن. فقط عنوان.`);
  await streamPiece(client, res, "intro", `یک پاراگراف مقدمه فارسی درباره ${topic} با لحن ${tone} و استفاده از ${keywords} بنویس.`);
  await streamPiece(client, res, "toc", `فهرست مطالب فارسی این مقاله را با تیترهای H2 و زیرتیترهای H3 تولید کن. فقط لیست آیتم‌ها را بده.`);
  const sections = await generateText(client, `بر اساس فهرست مطالب بالا، برای هر H2 یک پاراگراف و برای هر H3 زیر آن پاراگراف مرتبط فارسی با لحن ${tone} بنویس. خروجی را به ترتیب نشان بده.`);
  await streamRaw(res, "sections", sections);
  await streamPiece(client, res, "conclusion", `یک پاراگراف جمع‌بندی فارسی برای این مقاله بنویس.`);
  if (needFaq) await streamPiece(client, res, "faq", `۳ پرسش متداول فارسی مرتبط با ${topic} همراه با پاسخ کوتاه تولید کن.`);
  sseClose(res);
});

async function streamPiece(client: OpenAI, res: Response, event: string, prompt: string) {
  const stream = await client.responses.stream({
    model: "gpt-4o-mini",
    input: prompt
  });
  for await (const delta of stream) {
    const t = (delta as any)?.output_text || "";
    if (t) sseSend(res, event, t);
  }
}

async function generateText(client: OpenAI, prompt: string) {
  const res = await client.responses.create({
    model: "gpt-4o-mini",
    input: prompt
  });
  return (res as any).output_text || "";
}

async function streamRaw(res: Response, event: string, text: string) {
  const parts = text.split(/(\n+)/);
  for (const p of parts) {
    if (p) sseSend(res, event, p);
    await new Promise(r => setTimeout(r, 30));
  }
}

export default router;
