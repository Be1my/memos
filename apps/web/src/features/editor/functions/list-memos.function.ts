import { Temporal } from "@js-temporal/polyfill";
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
		{ attachment },
		{ createAuth },
		{ getRequestHeaders },
		{ desc, eq, like, and, sql },
	] = await Promise.all([
		import("@memos/db"),
		import("@memos/db/schema/memo.table"),
		import("@memos/db/schema/attachment.table"),
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
		const start = Temporal.PlainDate.from(filter.date);
		const end = start.add({ days: 1 });
		conditions.push(
			sql`${memo.createdAt} >= ${start.toString()}::timestamptz AND ${memo.createdAt} < ${end.toString()}::timestamptz`,
		);
	}

	if (filter.tag) {
		conditions.push(sql`${filter.tag} = ANY(${memo.tags})`);
	}

	const rows = await db
		.select()
		.from(memo)
		.leftJoin(attachment, eq(attachment.memoId, memo.id))
		.where(and(...conditions))
		.orderBy(desc(memo.createdAt))
		.limit(20);

	const memoMap = new Map<
		number,
		typeof memo.$inferSelect & {
			attachments: (typeof attachment.$inferSelect)[];
		}
	>();
	for (const row of rows) {
		if (!memoMap.has(row.memo.id)) {
			memoMap.set(row.memo.id, { ...row.memo, attachments: [] });
		}
		if (row.attachment) {
			memoMap.get(row.memo.id)?.attachments.push(row.attachment);
		}
	}

	return Array.from(memoMap.values()).map((m) => ({
		id: m.id,
		uid: m.uid,
		content: m.content,
		payload: m.payload,
		visibility: m.visibility,
		tags: m.tags,
		createdAt: m.createdAt.toISOString(),
		attachments: m.attachments.map((a) => ({
			id: a.id,
			uid: a.uid,
			filename: a.filename,
			type: a.type,
			size: a.size,
			storageType: a.storageType,
			reference: a.reference,
		})),
	}));
});
