import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

import { UpdateMemoInputSchema } from "../schemas/update-memo";

const visibilityMap: Record<string, "PRIVATE" | "PUBLIC" | "PROTECTED"> = {
	private: "PRIVATE",
	workspace: "PROTECTED",
	public: "PUBLIC",
};

export const updateMemoFn = createServerFn({ method: "POST", strict: { output: false } })
	.inputValidator(UpdateMemoInputSchema)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) throw new Error("Not authenticated");

		const [
			{ createDb },
			{ memo },
			{ eq, and },
		] = await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/memo.table"),
			import("drizzle-orm"),
		]);

		const db = createDb();

		const updateData: Partial<typeof memo.$inferInsert> = {
			content: data.content,
			payload: data.payload,
			visibility: visibilityMap[data.visibility] ?? "PRIVATE",
			updatedAt: new Date(),
		};

		if (data.createdAt) {
			updateData.createdAt = new Date(data.createdAt);
		}

		const [updated] = await db
			.update(memo)
			.set(updateData)
			.where(
				and(eq(memo.uid, data.memoId), eq(memo.creatorId, context.session.user.id)),
			)
			.returning({
				uid: memo.uid,
				content: memo.content,
				payload: memo.payload,
				visibility: memo.visibility,
				createdAt: memo.createdAt,
				updatedAt: memo.updatedAt,
			});

		if (!updated) throw new Error("Memo not found or not authorized");

		return {
			...updated,
			createdAt: updated.createdAt.toISOString(),
			updatedAt: updated.updatedAt.toISOString(),
		};
	});
