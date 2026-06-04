import { user } from "@/db/schema/auth.table";
import { createServerFn } from "@tanstack/react-start";
import { dbMiddleware, sessionMiddleware } from "@/middleware";

export const getIsFirstUserFn = createServerFn({ method: "GET" })
	.middleware([dbMiddleware])
	.handler(async ({ context }) => {
		const db = context.db;
		const count = await db.$count(user);
		return { isFirstUser: count === 0 };
	});

export const getSessionFn = createServerFn({ method: "GET" })
	.middleware([sessionMiddleware])
	.handler(async ({ context }) => {
		return context.session;
	});