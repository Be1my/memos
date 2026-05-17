import { createServerFn } from "@tanstack/react-start";

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
	.handler(async ({ data }) => {
		const [
			{ createDb },
			{ reaction },
			{ user },
			{ createAuth },
			{ getRequestHeaders },
			{ eq },
		] = await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/reaction.table"),
			import("@memos/db/schema/auth.table"),
			import("@memos/auth"),
			import("@tanstack/react-start/server"),
			import("drizzle-orm"),
		]);

		const headers = getRequestHeaders();
		const session = await createAuth().api.getSession({ headers });
		if (!session) {
			return [];
		}

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
