import { createServerFn } from "@tanstack/react-start";

export const toggleReactionFn = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => {
		const data = input as { contentId: string; reactionType: string };
		if (!data.contentId || !data.reactionType) {
			throw new Error("contentId and reactionType are required");
		}
		return data;
	})
	.handler(async ({ data }) => {
		const [
			{ createDb },
			{ reaction },
			{ createAuth },
			{ getRequestHeaders },
			{ eq, and },
		] = await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/reaction.table"),
			import("@memos/auth"),
			import("@tanstack/react-start/server"),
			import("drizzle-orm"),
		]);

		const headers = getRequestHeaders();
		const session = await createAuth().api.getSession({ headers });
		if (!session) {
			throw new Error("Not authenticated");
		}

		const db = createDb();

		const existing = await db
			.select()
			.from(reaction)
			.where(
				and(
					eq(reaction.creatorId, session.user.id),
					eq(reaction.contentId, data.contentId),
					eq(reaction.reactionType, data.reactionType),
				),
			)
			.limit(1);

		if (existing.length > 0) {
			await db
				.delete(reaction)
				.where(
					and(
						eq(reaction.creatorId, session.user.id),
						eq(reaction.contentId, data.contentId),
						eq(reaction.reactionType, data.reactionType),
					),
				);
			return { action: "removed" as const };
		}

		await db
			.insert(reaction)
			.values({
				creatorId: session.user.id,
				contentId: data.contentId,
				reactionType: data.reactionType,
			})
			.onConflictDoNothing();

		return { action: "added" as const };
	});
