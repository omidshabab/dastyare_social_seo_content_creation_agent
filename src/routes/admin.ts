import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { requestLogs } from "../db/schema";
import { desc, eq, and, like } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/request-logs", requireAuth, async (req: Request, res: Response) => {
  const limit = Math.max(1, Math.min(200, Number(req.query.limit || 50)));
  const offset = Math.max(0, Number(req.query.offset || 0));
  const method = typeof req.query.method === "string" ? String(req.query.method).toUpperCase() : "";
  const path = typeof req.query.path === "string" ? String(req.query.path) : "";

  const filters: any[] = [];
  if (method) filters.push(eq(requestLogs.method, method));
  if (path) filters.push(like(requestLogs.path, `%${path}%`));

  const where = filters.length ? and(...filters) : undefined;
  const rows = await db
    .select()
    .from(requestLogs)
    .where(where as any)
    .orderBy(desc(requestLogs.id))
    .limit(limit)
    .offset(offset);

  res.json({ items: rows, limit, offset });
});

export default router;
