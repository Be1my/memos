import { createAuth } from "@memos/auth";
import { createMiddleware } from "@tanstack/react-start";
import { unauthorized } from "@/lib/errors";

export const authMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const session = await createAuth().api.getSession({
			headers: request.headers,
		});
		if (!session) throw unauthorized();
		return next({
			context: { session },
		});
	},
);
