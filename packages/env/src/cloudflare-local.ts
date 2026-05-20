const runtimeEnv: Record<string, string | undefined> =
	typeof process !== "undefined" && process.env
		? (process.env as Record<string, string | undefined>)
		: {};

export const env = new Proxy({} as Env, {
	get(_target, prop) {
		if (typeof prop !== "string") {
			return undefined;
		}

		return runtimeEnv[prop];
	},
});
