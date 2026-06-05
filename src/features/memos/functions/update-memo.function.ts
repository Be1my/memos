import { VISIBILITY_MAP } from "@/db/schema/enums";
import { memo } from "@/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { notFound, UnauthorizedError } from "@/lib/errors";
import { coreMiddleware } from "@/middleware";

import { UpdateMemoInputSchema } from "../schemas/update-memo";

export const updateMemoFn = createServerFn({ method: "POST" })
	.inputValidator(UpdateMemoInputSchema)
	.middleware([coreMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			throw new UnauthorizedError();
		}
		const db = context.db;

		const updateData: Partial<typeof memo.$inferInsert> = {
			content: data.content,
			payload: data.payload,
			visibility: VISIBILITY_MAP[data.visibility] ?? "PRIVATE",
			updatedAt: new Date(),
		};

		if (data.createdAt) {
			updateData.createdAt = new Date(data.createdAt);
		}

		const [updated] = await db
			.update(memo)
			.set(updateData)
			.where(
				and(
					eq(memo.uid, data.memoId),
					eq(memo.creatorId, context.session.user.id),
				),
			)
			.returning({
				uid: memo.uid,
				content: memo.content,
				payload: memo.payload,
				visibility: memo.visibility,
				createdAt: memo.createdAt,
				updatedAt: memo.updatedAt,
			});

		if (!updated) throw notFound("Memo not found");

		return {
			...updated,
			payload: updated.payload,
			createdAt: updated.createdAt.toISOString(),
			updatedAt: updated.updatedAt.toISOString(),
		};
	});