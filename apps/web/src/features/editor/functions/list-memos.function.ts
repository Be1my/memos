import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

import type { ListMemosFilter } from "./list-memos.shared";
import { queryMemos } from "./list-memos.shared";

export type { ListMemosFilter };
export { queryMemos };

export const listMemosFn = createServerFn({
	method: "GET",
	strict: false,
}).middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		const filter = (data ?? {}) as ListMemosFilter;

		const [{ memo }, { eq }] =
			await Promise.all([
				import("@memos/db/schema/memo.table"),
				import("drizzle-orm"),
			]);

		const conditions = [eq(memo.creatorId, context.session?.user.id ?? "")];

		const memos = await queryMemos(conditions, filter, true);
		return memos;
});
