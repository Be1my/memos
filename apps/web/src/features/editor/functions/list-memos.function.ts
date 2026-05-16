import { createServerFn } from "@tanstack/react-start";

export interface ListMemosFilter {
	q?: string;
	date?: string;
	tag?: string;
}

export const listMemosFn = createServerFn({
	method: "GET",
	strict: false,
}).handler(async (data: unknown) => {
	const filter = (data ?? {}) as ListMemosFilter;

	const [
		{ createDb },
		{ memo },
		{ createAuth },
		{ getRequestHeaders },
		{ desc, eq, like, and, sql },
	] = await Promise.all([
		import("@memos/db"),
		import("@memos/db/schema/memo.table"),
		import("@memos/auth"),
		import("@tanstack/react-start/server"),
		import("drizzle-orm"),
	]);

	const headers = getRequestHeaders();
	const session = await createAuth().api.getSession({ headers });

	const db = createDb();

	const conditions = [eq(memo.creatorId, session?.user.id ?? "")];

	if (filter.q) {
		conditions.push(like(memo.content, `%${filter.q}%`));
	}

	if (filter.date) {
		const start = new Date(filter.date);
		const end = new Date(start);
		end.setDate(end.getDate() + 1);
		conditions.push(
			sql`${memo.createdAt} >= ${start} AND ${memo.createdAt} < ${end}`,
		);
	}

	if (filter.tag) {
		conditions.push(sql`${filter.tag} = ANY(${memo.tags})`);
	}

	const memos = await db
		.select()
		.from(memo)
		.where(and(...conditions))
		.orderBy(desc(memo.createdAt))
		.limit(20);

	return memos.map((m) => ({
		id: m.id,
		uid: m.uid,
		content: m.content,
		payload: m.payload,
		visibility: m.visibility,
		tags: m.tags,
		createdAt: m.createdAt.toISOString(),
	}));
});
