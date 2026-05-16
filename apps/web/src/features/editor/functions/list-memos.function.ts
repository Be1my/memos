import { createServerFn } from "@tanstack/react-start";

export const listMemosFn = createServerFn({ method: "GET" }).handler(async () => {
	const [{ createDb }, { memo }, { createAuth }, { getRequestHeaders }, { desc, eq }] =
		await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/memo.table"),
			import("@memos/auth"),
			import("@tanstack/react-start/server"),
			import("drizzle-orm"),
		]);

	const headers = getRequestHeaders();
	const session = await createAuth().api.getSession({ headers });

	const db = createDb();

	const memos = await db
		.select()
		.from(memo)
		.where(eq(memo.creatorId, session?.user.id ?? ""))
		.orderBy(desc(memo.createdAt))
		.limit(20);

	return memos.map((m) => ({
		id: m.id,
		uid: m.uid,
		content: m.content,
		visibility: m.visibility,
		tags: m.tags,
		createdAt: m.createdAt.toISOString(),
	}));
});
