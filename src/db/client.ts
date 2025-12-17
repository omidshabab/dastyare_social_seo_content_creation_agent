import { env } from "../env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({ connectionString: env.databaseUrl });
export const db = drizzle(pool);
export const pgPool = pool;
