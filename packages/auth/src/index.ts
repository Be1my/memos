import { createDb } from "@memos/db";
import * as schema from "@memos/db/schema/auth.table";
import { env } from "@memos/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

type _GetSessionResult = Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
export type AuthUser = NonNullable<_GetSessionResult>["user"];

export function createAuth() {
	const db = createDb();

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",

			schema: schema,
		}),
		trustedOrigins: [env.CORS_ORIGIN],
		emailAndPassword: {
			enabled: true,
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: {
			allowedHosts: [
				env.BETTER_AUTH_URL,
				...env.ALLOWED_HOSTS.split(",")
					.map((h) => h.trim())
					.filter(Boolean),
			],
			protocol: "https",
		},
		plugins: [tanstackStartCookies()],
		user: {
			additionalFields: {
				role: {
					type: ["USER", "ADMIN", "HOST"],
					required: false,
					defaultValue: "USER",
					input: false,
				},
			},
		},
		databaseHooks: {
			user: {
				create: {
					before: async (user) => {
						const db = createDb();
						const count = await db.$count(schema.user);
						if (count === 0) {
							return { data: { ...user, role: "ADMIN" } };
						}
						return { data: user };
					},
				},
			},
		},
	});
}
