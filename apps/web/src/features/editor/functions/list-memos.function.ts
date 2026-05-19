import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { createServerFn } from "@tanstack/react-start";
import { parseTimezoneFromHeaders } from "@/lib/parse-timezone-from-headers";
import type { ListMemosFilter } from "./list-memos.shared";
import { queryMemos } from "./list-memos.shared";

export type { ListMemosFilter };
export { queryMemos };

export const listMemosFn = createServerFn({
	method: "GET",
	strict: false,
}).handler(async (data: unknown) => {
	const filter = (data ?? {}) as ListMemosFilter;

	const [{ memo }, { createAuth }, { getRequestHeaders }, { eq }] =
		await Promise.all([
			import("@memos/db/schema/memo.table"),
			import("@memos/auth"),
			import("@tanstack/react-start/server"),
			import("drizzle-orm"),
		]);

	const headers = getRequestHeaders();
	const session = await createAuth().api.getSession({ headers });

	const conditions = [eq(memo.creatorId, session?.user.id ?? "")];

	const memos = await queryMemos(conditions, filter);
	const timeZone = parseTimezoneFromHeaders(headers);
	return memos.map((m) => ({
		...m,
		formattedTime: format(new TZDate(m.createdAt, timeZone), "yyyy/MM/dd HH:mm"),
	}));
});
