import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// In Cloudflare, env vars are accessed via the context (c.env),
// but for Drizzle queries outside routes, we pass the connection string.
export const setupDb = (connectionString: string) => {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
};
