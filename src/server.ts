import handler from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server";
import { initEnv } from "@/lib/env";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		initEnv(env);
		return paraglideMiddleware(request, () => handler.fetch(request));
	},
};
