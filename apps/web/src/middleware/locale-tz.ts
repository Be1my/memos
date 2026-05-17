import { createMiddleware } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const localeTzMiddleware = createMiddleware().server(
	async ({ next }) => {
		const locale = getCookie("PARAGLIDE_LOCALE") || "en";
		const timeZone = getCookie("tz") || "UTC";

		return next({ context: { locale, timeZone } });
	},
);
