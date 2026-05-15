import { createDb } from "@memos/db";
import * as schema from "@memos/db/schema/auth.table";
import { createServerFn } from "@tanstack/react-start";

export const getIsFirstUserFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const db = createDb();
		const count = await db.$count(schema.user);
		return { isFirstUser: count === 0 };
	},
);
