import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/files/$")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: {
					middleware: [],
					handler: async ({ request, context }) => {
						const url = new URL(request.url);
						const key = url.pathname.replace("/api/files/", "");

						if (!key || !key.startsWith("uploads/")) {
							return new Response("Invalid path", { status: 400 });
						}

						const bucket = context.env.ATTACHMENTS_BUCKET;
						const object = await bucket.get(key);

						if (!object) {
							return new Response("Not found", { status: 404 });
						}

						return new Response(object.body, {
							headers: {
								"Content-Type":
									object.httpMetadata?.contentType || "application/octet-stream",
								"Cache-Control": "private, max-age=31536000",
							},
						});
					},
				},
			}),
	},
});