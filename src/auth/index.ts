import { createDb } from "@/db";
import * as schema from "@/db/schema/auth.table";
import { serverEnv } from "@/lib/env/server.env";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

type _GetSessionResult = Awaited<
	ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>
>;
export type AuthUser = NonNullable<_GetSessionResult>["user"];

export function createAuth(env: Env) {
	const db = createDb(env);
	const validEnv = serverEnv(env);

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",

			schema: schema,
		}),
		trustedOrigins: [validEnv.CORS_ORIGIN],
		emailAndPassword: {
			enabled: true,
		},
		secret: validEnv.BETTER_AUTH_SECRET,
		baseURL: {
			allowedHosts: [
				validEnv.BETTER_AUTH_URL,
				...validEnv.ALLOWED_HOSTS.split(",")
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
						const db = createDb(env);
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