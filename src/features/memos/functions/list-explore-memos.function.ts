import { memo } from "@/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { sessionMiddleware } from "@/middleware";
import { localeTzMiddleware } from "@/middleware/locale-tz";
import type { ListMemosFilter } from "./list-memos.shared";
import { ListMemosFilterSchema, queryMemos } from "./list-memos.shared";

export type { ListMemosFilter };

export const listExploreMemosFn = createServerFn({ method: "GET" })
	.inputValidator(ListMemosFilterSchema.optional().default({}))
	.middleware([sessionMiddleware, localeTzMiddleware])
	.handler(async ({ data, context }) => {
		const filter = data;

		const conditions = context.session?.user
			? [
					sql`(${memo.visibility} IN ('PUBLIC', 'PROTECTED') OR ${memo.creatorId} = ${context.session.user.id})`,
				]
			: [eq(memo.visibility, "PUBLIC")];

		const memos = await queryMemos(conditions, filter, false, context.timeZone, context.db);
		return memos;
	});