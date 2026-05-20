import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

import { ListMemosFilterSchema, queryMemos } from "./list-memos.shared";
import type { ListMemosFilter } from "./list-memos.shared";

export type { ListMemosFilter };

export const listExploreMemosFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(ListMemosFilterSchema.optional().default({}))
	.handler(async ({ data, context }) => {
		const filter = data;

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
