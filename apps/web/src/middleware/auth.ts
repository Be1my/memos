import { createMiddleware } from "@tanstack/react-start";
import { unauthorized } from "@/lib/errors";

export const authMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const [{ createAuth }, { env }, { AwsClient }] = await Promise.all([
			import("@memos/auth"),
			import("@memos/env/server"),
			import("aws4fetch"),
		]);

		const R2_ENDPOINT = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
		const r2 = new AwsClient({
			accessKeyId: env.R2_ACCESS_KEY_ID,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY,
		});

		async function deleteFromR2(keys: string[]) {
			await Promise.allSettled(
				keys.map((key) => {
					const url = new URL(`${R2_ENDPOINT}/attachments/${key}`);
					return r2.fetch(new Request(url, { method: "DELETE" }));
				}),
			);
		}

		const session = await createAuth().api.getSession({
			headers: request.headers,
		});
		if (!session) throw unauthorized();
		return next({
			context: { session, deleteFromR2 },
		});
	},
);
