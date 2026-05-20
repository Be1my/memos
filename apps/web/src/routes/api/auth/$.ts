import { createAuth } from "@memos/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: {
					handler: ({ request }) => {
						const auth = createAuth();
						return auth.handler(request);
					},
				},
				POST: {
					handler: ({ request }) => {
						const auth = createAuth();
						return auth.handler(request);
					},
				},
			}),
	},
});
