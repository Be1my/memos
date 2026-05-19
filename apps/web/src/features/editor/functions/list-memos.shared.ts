import { addDays, format, parse } from "date-fns";
import type { SQL } from "drizzle-orm";

export interface ListMemosFilter {
	q?: string;
	date?: string;
	tag?: string;
}

export async function queryMemos(
	conditions: SQL[],
	filter?: ListMemosFilter,
	orderByPinned?: boolean,
) {
	const [
		{ createDb },
		{ memo },
		{ attachment },
		{ reaction },
		{ user },
		{ desc, eq, like, and, sql, inArray },
	] = await Promise.all([
		import("@memos/db"),
		import("@memos/db/schema/memo.table"),
		import("@memos/db/schema/attachment.table"),
		import("@memos/db/schema/reaction.table"),
		import("@memos/db/schema/auth.table"),
		import("drizzle-orm"),
	]);

	const db = createDb();

	if (filter?.q) {
		conditions.push(like(memo.content, `%${filter.q}%`));
	}

	if (filter?.date) {
		const start = parse(filter.date, "yyyy-MM-dd", new Date());
		const end = addDays(start, 1);
		conditions.push(
			sql`${memo.createdAt} >= ${format(start, "yyyy-MM-dd")}::timestamptz AND ${memo.createdAt} < ${format(end, "yyyy-MM-dd")}::timestamptz`,
		);
	}

	if (filter?.tag) {
		conditions.push(sql`${filter.tag} = ANY(${memo.tags})`);
	}

	const rows = await db
		.select()
		.from(memo)
		.leftJoin(attachment, eq(attachment.memoId, memo.id))
		.where(and(...conditions))
		.orderBy(
			...(orderByPinned
				? [desc(memo.pinned), desc(memo.createdAt)]
				: [desc(memo.createdAt)]),
		)
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

	const memosList = Array.from(memoMap.values());

	const uids = memosList.map((m) => m.uid);
	const reactionsRows =
		uids.length > 0
			? await db
					.select({
						id: reaction.id,
						reactionType: reaction.reactionType,
						creatorId: reaction.creatorId,
						creatorName: user.name,
						contentId: reaction.contentId,
					})
					.from(reaction)
					.innerJoin(user, eq(user.id, reaction.creatorId))
					.where(inArray(reaction.contentId, uids))
					.orderBy(reaction.createdAt)
			: [];

	const reactionsByContentId = new Map<string, typeof reactionsRows>();
	for (const r of reactionsRows) {
		const existing = reactionsByContentId.get(r.contentId) ?? [];
		existing.push(r);
		reactionsByContentId.set(r.contentId, existing);
	}

	return memosList.map((m) => ({
		id: m.id,
		uid: m.uid,
		content: m.content,
		payload: m.payload,
		visibility: m.visibility,
		tags: m.tags,
		pinned: m.pinned,
		createdAt: m.createdAt.toISOString(),
		updatedAt: m.updatedAt.toISOString(),
		attachments: m.attachments.map((a) => ({
			id: a.id,
			uid: a.uid,
			filename: a.filename,
			type: a.type,
			size: a.size,
			storageType: a.storageType,
			reference: a.reference,
		})),
		reactions: (reactionsByContentId.get(m.uid) ?? []).map((r) => ({
			id: r.id,
			creatorId: r.creatorId,
			creatorName: r.creatorName,
			reactionType: r.reactionType,
		})),
	}));
}
