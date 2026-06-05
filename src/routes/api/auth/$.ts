import { createFileRoute } from "@tanstack/react-router";
import { dbMiddleware } from "@/middleware";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: {
					middleware: [dbMiddleware],
					handler: async ({ request, context }) => {
						const { createAuth } = await import("@/auth");
						const auth = createAuth(context.env);
						return auth.handler(request);
					},
				},
				POST: {
					middleware: [dbMiddleware],
					handler: async ({ request, context }) => {
						const { createAuth } = await import("@/auth");
						const auth = createAuth(context.env);
						return auth.handler(request);
					},
				},
			}),
	},
});