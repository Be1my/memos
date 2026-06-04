import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createAuth } from "@/auth";
import { createDb } from "@/db";
import { serverEnv } from "@/lib/env/server.env";
import { unauthorized } from "@/lib/errors";

export const envMiddleware = createMiddleware().server(async ({ next, context }) => {
	const rawEnv = (context ?? {}) as Record<string, unknown>;
	if (!rawEnv.env) {
		throw new Error("env not found in context");
	}
	return next({
		context: {
			...((context ?? {}) as Record<string, unknown>),
			env: rawEnv.env as Env,
		},
	});
});

export const dbMiddleware = createMiddleware()
	.middleware([envMiddleware])
	.server(async ({ next, context }) => {
		const env = serverEnv(context.env as Env);
		const db = createDb(context.env as Env);
		return next({
			context: {
				...context,
				db,
				env,
			},
		});
	});

export const sessionMiddleware = createMiddleware()
	.middleware([dbMiddleware])
	.server(async ({ next, context }) => {
		const auth = createAuth(context.env as Env);
		const session = await auth.api.getSession({
			headers: getRequestHeaders(),
		});
		return next({
			context: {
				...context,
				session,
			},
		});
	});

export const authMiddleware = createMiddleware()
	.middleware([sessionMiddleware])
	.server(async ({ next, context }) => {
		if (!context.session) {
			throw unauthorized();
		}
		return next({
			context: {
				...context,
				user: context.session.user,
			},
		});
	});