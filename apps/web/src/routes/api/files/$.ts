import { createFileRoute } from "@tanstack/react-router";

import { env } from "@memos/env/server";

import { authMiddleware } from "@/middleware/auth";
import { jsonError } from "@/lib/errors";

export const Route = createFileRoute("/api/files/$")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: {
					middleware: [authMiddleware],
					handler: async ({ request, context }) => {
						if (!context.session) return jsonError("Unauthorized", "UNAUTHORIZED", 401);

						const url = new URL(request.url);
						const key = url.searchParams.get("key");
						if (!key) return jsonError("Missing key", "BAD_REQUEST", 400);

						if (!key.startsWith("uploads/")) {
							return jsonError("Invalid key", "BAD_REQUEST", 400);
						}

						const object = await env.ATTACHMENTS_BUCKET.get(key);
						if (!object) return jsonError("Not found", "NOT_FOUND", 404);

						const headers = new Headers();
						object.writeHttpMetadata(headers);
						headers.set("Cache-Control", "public, max-age=31536000");
						return new Response(object.body, { headers });
					},
				},
			}),
	},
});
