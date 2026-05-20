import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

import { ListMemosFilterSchema, queryMemos } from "./list-memos.shared";
import type { ListMemosFilter } from "./list-memos.shared";

export type { ListMemosFilter };
export { queryMemos };

export const listMemosFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(ListMemosFilterSchema.optional().default({}))
	.handler(async ({ data, context }) => {
		const filter = data;

		const [{ memo }, { eq }] =
			await Promise.all([
				import("@memos/db/schema/memo.table"),
				import("drizzle-orm"),
			]);

		const conditions = [eq(memo.creatorId, context.session?.user.id ?? "")];

		const memos = await queryMemos(conditions, filter, true);
		return memos;
});
