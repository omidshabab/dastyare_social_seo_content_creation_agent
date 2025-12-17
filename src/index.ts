import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { env } from "./env";
import authRoutes from "./routes/auth";
import creditRoutes from "./routes/credit";
import contentRoutes from "./routes/content";
import { requestLogger } from "./middleware/requestLogger";
import adminRoutes from "./routes/admin";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use(express.static(path.join(process.cwd(), "public")));
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/api/health", (req: Request, res: Response) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/credit", creditRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/admin", adminRoutes);

app.listen(env.port, () => {});
