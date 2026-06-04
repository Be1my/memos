import { z } from "zod";

const serverEnvSchema = z.object({
	DATABASE_URL: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.string().url(),
	CORS_ORIGIN: z.string().url(),
	ALLOWED_HOSTS: z.string(),
});

let _env: z.infer<typeof serverEnvSchema> | null = null;

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

export function initEnv(env: Env) {
	_env = serverEnv(env);
	return _env;
}

export function getEnv() {
	if (!_env) {
		throw new Error("Env not initialized. Call initEnv first.");
	}
	return _env;
}

export const env = new Proxy({} as z.infer<typeof serverEnvSchema>, {
	get(_target, prop) {
		if (!_env) {
			throw new Error("Env not initialized. Call initEnv first.");
		}
		return _env[prop as keyof typeof _env];
	},
});