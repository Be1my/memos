import { memo } from "@memos/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";

import { authMiddleware } from "@/middleware/auth";
import { localeTzMiddleware } from "@/middleware/locale-tz";
import type { ListMemosFilter } from "./list-memos.shared";
import { ListMemosFilterSchema, queryMemos } from "./list-memos.shared";

export type { ListMemosFilter };

export const listExploreMemosFn = createServerFn({ method: "GET" })
	.inputValidator(ListMemosFilterSchema.optional().default({}))
	.middleware([authMiddleware, localeTzMiddleware])
	.handler(async ({ data, context }) => {
		const filter = data;

		const conditions = context.session?.user
			? [
					sql`(${memo.visibility} IN ('PUBLIC', 'PROTECTED') OR ${memo.creatorId} = ${context.session.user.id})`,
				]
			: [eq(memo.visibility, "PUBLIC")];

		const memos = await queryMemos(conditions, filter, false, context.timeZone);
		return memos;
	});
