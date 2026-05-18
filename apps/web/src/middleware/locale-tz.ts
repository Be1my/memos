// apps/web/src/middleware/locale-tz.ts
import { createMiddleware } from "@tanstack/react-start";

export const localeTzMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const cookieHeader = request.headers.get("cookie") || "";
		const locale = cookieHeader.includes("PARAGLIDE_LOCALE")
			? cookieHeader.split("PARAGLIDE_LOCALE=")[1]?.split(";")[0]
			: "en";
		const timeZone = cookieHeader.includes("memos-tz")
			? cookieHeader.split("memos-tz=")[1]?.split(";")[0]
			: "UTC";

		return next({ context: { locale, timeZone: timeZone || "UTC" } });
	},
);