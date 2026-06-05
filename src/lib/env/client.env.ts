import z from "zod";

const clientEnvSchema = z.object({});

export function clientEnv() {
	return clientEnvSchema.parse(import.meta.env);
}