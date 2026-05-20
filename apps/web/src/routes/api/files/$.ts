import { createFileRoute } from "@tanstack/react-router";

import { authMiddleware } from "@/middleware/auth";

export const Route = createFileRoute("/api/files/$")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ request, context }) => {
				if (!context.session) return new Response("Unauthorized", { status: 401 });

				const url = new URL(request.url);
				const key = url.searchParams.get("key");
				if (!key) return new Response("Missing key", { status: 400 });

				if (!key.startsWith("uploads/")) {
					return new Response("Invalid key", { status: 400 });
				}

				const [{ env }] = await Promise.all([
					import("@memos/env/server"),
				]);

				const object = await env.ATTACHMENTS_BUCKET.get(key);
				if (!object) return new Response("Not found", { status: 404 });

				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set("Cache-Control", "public, max-age=31536000");
				return new Response(object.body, { headers });
			},
		},
	},
});
