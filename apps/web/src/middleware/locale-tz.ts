// apps/web/src/middleware/locale-tz.ts
import { createMiddleware } from "@tanstack/react-start";

function parseCookies(cookieHeader: string): Record<string, string> {
	const cookies: Record<string, string> = {};
	if (!cookieHeader) return cookies;

	cookieHeader.split(";").forEach((part) => {
		const [name, ...rest] = part.trim().split("=");
		if (name) {
			try {
				cookies[name] = decodeURIComponent(rest.join("=") || "");
			} catch {
				cookies[name] = rest.join("=") || "";
			}
		}
	});

	return cookies;
}

export const localeTzMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		const cookieHeader = request.headers.get("cookie") || "";
		const cookies = parseCookies(cookieHeader);

		const locale = cookies["PARAGLIDE_LOCALE"] || "en";
		const timeZone = cookies["tz"] || "UTC";

		return next({ context: { locale, timeZone } });
	},
);