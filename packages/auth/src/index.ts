import { createDb } from "@memos/db";
import * as schema from "@memos/db/schema/auth.table";
import { env } from "@memos/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

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
				"memos-web-eimy.aseuo0726.workers.dev", // 你的主域名
				"*.aseuo0726.workers.dev", // 如果以后有其他子 worker 也可以匹配
				env.BETTER_AUTH_URL,
				// 如果你后面绑了自定义域名，也加进来，例如：
				// "auth.yourdomain.com",
				// "memos.yourdomain.com",
			],
			protocol: "https", // 强制 https
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
