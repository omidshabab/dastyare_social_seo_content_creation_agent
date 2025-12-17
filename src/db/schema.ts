import { pgTable, serial, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const requestLogs = pgTable("request_logs", {
  id: serial("id").primaryKey(),
  requestId: varchar("request_id", { length: 64 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  path: text("path").notNull(),
  query: text("query").notNull().default(""),
  status: integer("status").notNull(),
  userId: integer("user_id"),
  ip: varchar("ip", { length: 100 }).notNull().default(""),
  userAgent: text("user_agent").notNull().default(""),
  requestBody: text("request_body").notNull().default(""),
  durationMs: integer("duration_ms").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
