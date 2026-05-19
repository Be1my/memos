import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { createServerFn } from "@tanstack/react-start";

import { localeTzMiddleware } from "@/middleware/locale-tz";

export const getCalendarInfoFn = createServerFn({ method: "GET" })
	.middleware([localeTzMiddleware])
	.handler(async ({ context }) => {
		const { timeZone } = context;
		const today = format(new TZDate(Date.now(), timeZone), "yyyy-MM-dd");

		return { timeZone, today };
	});
