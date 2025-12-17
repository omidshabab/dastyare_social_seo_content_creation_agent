import { db } from "../db/client";
import { sessions } from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export async function createSession(userId: number) {
  const token = uuidv4().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 10 * 60 * 60 * 1000);
  await db.insert(sessions).values({ userId, token, expiresAt }).returning();
  return { token, expiresAt };
}

export async function getSession(token: string) {
  const rows = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  const s = rows[0] as any;
  if (!s) return null;
  if (new Date(s.expiresAt).getTime() < Date.now()) return null;
  return s;
}
