import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const getCalendarInfoFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const timeZone =
			getCookie("tz") || Intl.DateTimeFormat().resolvedOptions().timeZone;
		const now = new Date();
		const today = new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(now);

		return { timeZone, today };
	},
);
