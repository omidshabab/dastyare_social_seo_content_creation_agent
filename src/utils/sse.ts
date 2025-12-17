import { Response } from "express";

export function initSse(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
}

export function sseSend(res: Response, event: string, data: unknown) {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  res.write(`event: ${event}\n`);
  res.write(`data: ${payload}\n\n`);
}

export function sseClose(res: Response) {
  res.write("event: close\ndata: end\n\n");
  res.end();
}
