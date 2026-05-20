import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

import type { ListMemosFilter } from "./list-memos.shared";
import { queryMemos } from "./list-memos.shared";

export type { ListMemosFilter };

export const listExploreMemosFn = createServerFn({
	method: "GET",
	strict: false,
}).middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		const filter = (data ?? {}) as ListMemosFilter;

		const [{ memo }, { eq, sql }] =
			await Promise.all([
				import("@memos/db/schema/memo.table"),
				import("drizzle-orm"),
			]);

		const conditions = context.session?.user
			? [
					sql`(${memo.visibility} IN ('PUBLIC', 'PROTECTED') OR ${memo.creatorId} = ${context.session.user.id})`,
				]
			: [eq(memo.visibility, "PUBLIC")];

		const memos = await queryMemos(conditions, filter);
		return memos;
});
