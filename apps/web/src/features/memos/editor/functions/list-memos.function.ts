import { memo } from "@memos/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { authMiddleware } from "@/middleware/auth";
import { localeTzMiddleware } from "@/middleware/locale-tz";
import type { ListMemosFilter } from "./list-memos.shared";
import { ListMemosFilterSchema, queryMemos } from "./list-memos.shared";

export type { ListMemosFilter };
export { queryMemos };

export const listMemosFn = createServerFn({ method: "GET" })
	.inputValidator(ListMemosFilterSchema.optional().default({}))
	.middleware([authMiddleware, localeTzMiddleware])
	.handler(async ({ data, context }) => {
		const filter = data;

		const conditions = [eq(memo.creatorId, context.session?.user.id ?? "")];

		const memos = await queryMemos(conditions, filter, true, context.timeZone);
		return memos;
	});
