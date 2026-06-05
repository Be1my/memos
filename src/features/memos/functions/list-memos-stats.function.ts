import { memo } from "@/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { UnauthorizedError } from "@/lib/errors";
import { coreMiddleware } from "@/middleware";

export const listMemosStatsFn = createServerFn({
	method: "GET",
})
	.middleware([coreMiddleware])
	.handler(async ({ context }) => {
		if (!context.session) {
			throw new UnauthorizedError();
		}
		const db = context.db;

		const memos = await db
			.select({
				createdAt: memo.createdAt,
				tags: memo.tags,
			})
			.from(memo)
			.where(eq(memo.creatorId, context.session.user.id));

		const timestamps = memos.map((m) => m.createdAt.toISOString());

		const tagMap = new Map<string, number>();
		for (const m of memos) {
			for (const tag of m.tags) {
				tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
			}
		}
		const tags = Array.from(tagMap.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);

		return { timestamps, tags };
	});