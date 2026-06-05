import { memo } from "@/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { coreMiddleware } from "@/middleware";
import { UnauthorizedError } from "@/lib/errors";
import { localeTzMiddleware } from "@/middleware/locale-tz";
import type { ListMemosFilter } from "./list-memos.shared";
import { ListMemosFilterSchema, queryMemos } from "./list-memos.shared";

export type { ListMemosFilter };
export { queryMemos };

export const listMemosFn = createServerFn({ method: "GET" })
	.inputValidator(ListMemosFilterSchema.optional().default({}))
	.middleware([coreMiddleware, localeTzMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			throw new UnauthorizedError();
		}
		const filter = data;

		const conditions = [eq(memo.creatorId, context.session.user.id)];

		const memos = await queryMemos(conditions, filter, true, context.timeZone, context.db);
		return memos;
	});