import { Request, Response, NextFunction } from "express";
import { db } from "../db/client";
import { requestLogs } from "../db/schema";
import { v4 as uuidv4 } from "uuid";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = uuidv4().replace(/-/g, "");
  res.setHeader("X-Request-ID", requestId);
  const method = req.method;
  const path = req.originalUrl || req.url;
  const ip =
    typeof req.headers["x-forwarded-for"] === "string"
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req.ip;
  const userAgent = String(req.headers["user-agent"] || "");
  let query = "";
  try {
    query = JSON.stringify(req.query);
  } catch {
    query = "";
  }
  let requestBody = "";
  try {
    requestBody = JSON.stringify(req.body).slice(0, 2000);
  } catch {
    requestBody = "";
  }
  res.on("finish", async () => {
    const status = res.statusCode;
    const durationMs = Date.now() - start;
    const userId = (req as any).userId ?? null;
    try {
      await db.insert(requestLogs).values({
        requestId,
        method,
        path,
        query,
        status,
        userId,
        ip,
        userAgent,
        requestBody,
        durationMs
      });
    } catch {}
  });
  next();
}
