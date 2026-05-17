import { createServerFn } from "@tanstack/react-start";

import { localeTzMiddleware } from "@/middleware/locale-tz";

export const getCalendarInfoFn = createServerFn({ method: "GET" })
	.middleware([localeTzMiddleware])
	.handler(async ({ context }) => {
		console.log(context);
		const { timeZone } = context;
		// const timeZone = "Asia/Shanghai";
		const now = new Date();
		const today = new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(now);

		return { timeZone, today };
	});
