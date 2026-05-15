import { env } from "@memos/env/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export function createDb() {
	const sql = neon(env.DATABASE_URL);
	return drizzle({ client: sql, relations: schema.relations });
}
