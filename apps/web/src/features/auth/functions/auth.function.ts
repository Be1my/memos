import { createServerFn } from "@tanstack/react-start";

import { createDb } from "@memos/db";
import * as schema from "@memos/db/schema/auth.table";

import { authMiddleware } from "@/middleware/auth";

export const getUser = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.session;
	});

export const getIsFirstUserFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const db = createDb();
		const count = await db.$count(schema.user);
		return { isFirstUser: count === 0 };
	},
);
