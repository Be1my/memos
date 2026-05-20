import { createServerFn } from "@tanstack/react-start";

import { createDb } from "@memos/db";
import { reaction } from "@memos/db/schema/reaction.table";
import { eq, and } from "drizzle-orm";

import { authMiddleware } from "@/middleware/auth";
import { unauthorized } from "@/lib/errors";

import { ToggleReactionInputSchema } from "../schemas/toggle-reaction";

export const toggleReactionFn = createServerFn({ method: "POST" })
	.inputValidator(ToggleReactionInputSchema)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			throw unauthorized();
		}

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
