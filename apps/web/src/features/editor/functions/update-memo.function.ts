import { createServerFn } from "@tanstack/react-start";

const visibilityMap: Record<string, "PRIVATE" | "PUBLIC" | "PROTECTED"> = {
	private: "PRIVATE",
	workspace: "PROTECTED",
	public: "PUBLIC",
};

interface UpdateMemoInput {
	memoId: string;
	content: string;
	payload: Record<string, unknown>;
	visibility: string;
	createdAt?: string;
}

export const updateMemoFn = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => {
		const data = input as UpdateMemoInput;
		if (!data.memoId) throw new Error("memoId is required");
		if (!data.content?.trim()) throw new Error("Content is required");
		if (
			data.payload !== undefined &&
			(typeof data.payload !== "object" ||
				data.payload === null ||
				Array.isArray(data.payload))
		) {
			throw new Error("Payload must be a plain object");
		}
		return data;
	})
	.handler(async ({ data }) => {
		const [
			{ createDb },
			{ memo },
			{ createAuth },
			{ getRequestHeaders },
			{ eq, and },
		] = await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/memo.table"),
			import("@memos/auth"),
			import("@tanstack/react-start/server"),
			import("drizzle-orm"),
		]);

		const headers = getRequestHeaders();
		const session = await createAuth().api.getSession({ headers });
		if (!session) throw new Error("Not authenticated");

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
				and(eq(memo.uid, data.memoId), eq(memo.creatorId, session.user.id)),
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
