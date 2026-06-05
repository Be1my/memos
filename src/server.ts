import handler from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server";

declare module "@tanstack/react-router" {
	interface Register {
		server: {
			requestContext: {
				env: Env;
			};
		};
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		return paraglideMiddleware(request, () => handler.fetch(request, { context: { env } }));
	},
};