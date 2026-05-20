import { createServerFn } from "@tanstack/react-start";

import { createDb } from "@memos/db";
import { user } from "@memos/db/schema/auth.table";

import { authMiddleware } from "@/middleware/auth";

export const getIsFirstUserFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const db = createDb();
		const count = await db.$count(user);
		return { isFirstUser: count === 0 };
	},
);

export const getSessionFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.session;
	});
