import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

export const toggleReactionFn = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => {
		const data = input as { contentId: string; reactionType: string };
		if (!data.contentId || !data.reactionType) {
			throw new Error("contentId and reactionType are required");
		}
		return data;
	})
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			throw new Error("Not authenticated");
		}

		const [
			{ createDb },
			{ reaction },
			{ eq, and },
		] = await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/reaction.table"),
			import("drizzle-orm"),
		]);

		const db = createDb();

		const existing = await db
			.select()
			.from(reaction)
			.where(
				and(
					eq(reaction.creatorId, context.session.user.id),
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
						eq(reaction.creatorId, context.session.user.id),
						eq(reaction.contentId, data.contentId),
						eq(reaction.reactionType, data.reactionType),
					),
				);
			return { action: "removed" as const };
		}

		await db
			.insert(reaction)
			.values({
				creatorId: context.session.user.id,
				contentId: data.contentId,
				reactionType: data.reactionType,
			})
			.onConflictDoNothing();

		return { action: "added" as const };
	});
