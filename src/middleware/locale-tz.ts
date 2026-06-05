import { createMiddleware } from "@tanstack/react-start";
import { getCookies } from "@tanstack/react-start/server";

export const localeTzMiddleware = createMiddleware().server(
	async ({ next }) => {
		const cookies = getCookies();

		const locale = cookies.PARAGLIDE_LOCALE || "en";
		const timeZone = cookies["memos-tz"] || "UTC";

		return next({ context: { locale, timeZone } });
	},
);
