import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: {
					handler: async ({ request }) => {
						const { createAuth } = await import("@/auth");
						const auth = createAuth();
						return auth.handler(request);
					},
				},
				POST: {
					handler: async ({ request }) => {
						const { createAuth } = await import("@/auth");
						const auth = createAuth();
						return auth.handler(request);
					},
				},
			}),
	},
});
