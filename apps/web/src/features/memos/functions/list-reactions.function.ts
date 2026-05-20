import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

export interface ReactionUser {
	id: number;
	creatorId: string;
	creatorName: string;
	reactionType: string;
}

export const listReactionsFn = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) => {
		const data = input as { contentId: string };
		if (!data.contentId) {
			throw new Error("contentId is required");
		}
		return data;
	})
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			return [];
		}

		const [
			{ createDb },
			{ reaction },
			{ user },
			{ eq },
		] = await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/reaction.table"),
			import("@memos/db/schema/auth.table"),
			import("drizzle-orm"),
		]);

		const db = createDb();

		const rows = await db
			.select({
				id: reaction.id,
				reactionType: reaction.reactionType,
				creatorId: reaction.creatorId,
				creatorName: user.name,
				createdAt: reaction.createdAt,
			})
			.from(reaction)
			.innerJoin(user, eq(user.id, reaction.creatorId))
			.where(eq(reaction.contentId, data.contentId))
			.orderBy(reaction.createdAt);

		return rows.map((r) => ({
			...r,
			createdAt: r.createdAt.toISOString(),
		}));
	});
