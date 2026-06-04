import { z } from "zod";

const serverEnvSchema = z.object({
	DATABASE_URL: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.string().url(),
	CORS_ORIGIN: z.string().url(),
	ALLOWED_HOSTS: z.string(),
});

export function serverEnv(env: Env) {
	const result = serverEnvSchema.safeParse(env);

	if (!result.success) {
		console.error(
			JSON.stringify({
				message: "Invalid environment variables",
				error: result.error,
			}),
		);
		throw new Error("Invalid environment variables");
	}

	return result.data;
}