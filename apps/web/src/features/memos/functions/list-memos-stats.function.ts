import { createServerFn } from "@tanstack/react-start";

export const listMemosStatsFn = createServerFn({
	method: "GET",
	strict: false,
}).handler(async () => {
	const [
		{ createDb },
		{ memo },
		{ createAuth },
		{ getRequestHeaders: headers },
		{ eq },
	] = await Promise.all([
		import("@memos/db"),
		import("@memos/db/schema/memo.table"),
		import("@memos/auth"),
		import("@tanstack/react-start/server"),
		import("drizzle-orm"),
	]);

	const session = await createAuth().api.getSession({
		headers: headers(),
	});
	if (!session) {
		return { timestamps: [], tags: [] };
	}

	const db = createDb();

	const memos = await db
		.select({
			createdAt: memo.createdAt,
			tags: memo.tags,
		})
		.from(memo)
		.where(eq(memo.creatorId, session.user.id));

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
