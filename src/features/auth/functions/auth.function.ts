import { user } from "@/db/schema/auth.table";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createAuth } from "@/auth";
import { dbMiddleware } from "@/middleware";

export const getIsFirstUserFn = createServerFn({ method: "GET" })
	.middleware([dbMiddleware])
	.handler(async ({ context }) => {
		const db = context.db;
		const count = await db.$count(user);
		return { isFirstUser: count === 0 };
	});

export const getSessionFn = createServerFn({ method: "GET" })
	.middleware([dbMiddleware])
	.handler(async ({ context }) => {
		try {
			const auth = createAuth(context.env as Env);
			const session = await auth.api.getSession({
				headers: getRequestHeaders(),
			});
			return { session, user: session?.user ?? null };
		} catch {
			return { session: null, user: null };
		}
	});