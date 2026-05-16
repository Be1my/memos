import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/files/$")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const key = url.searchParams.get("key");
				if (!key) return new Response("Missing key", { status: 400 });

				const { env } = await import("@memos/env/server");
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
