import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/files/$")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const key = url.searchParams.get("key");
				if (!key) return new Response("Missing key", { status: 400 });

				if (!key.startsWith("uploads/")) {
					return new Response("Invalid key", { status: 400 });
				}

				const [{ createAuth }, { env }] = await Promise.all([
					import("@memos/auth"),
					import("@memos/env/server"),
				]);

				const session = await createAuth().api.getSession({
					headers: request.headers,
				});
				if (!session) return new Response("Unauthorized", { status: 401 });

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
