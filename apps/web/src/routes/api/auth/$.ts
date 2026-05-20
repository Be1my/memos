import { createAuth } from "@memos/auth";
import { createFileRoute } from "@tanstack/react-router";

const auth = createAuth();

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: {
					handler: ({ request }) => auth.handler(request),
				},
				POST: {
					handler: ({ request }) => auth.handler(request),
				},
			}),
	},
});
