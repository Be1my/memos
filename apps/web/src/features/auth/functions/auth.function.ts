import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

export const getIsFirstUserFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const [{ createDb }, { user }] = await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/auth.table"),
		]);
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
