import { createServerFn } from "@tanstack/react-start";

const visibilityMap: Record<string, "PRIVATE" | "PUBLIC" | "PROTECTED"> = {
	private: "PRIVATE",
	workspace: "PROTECTED",
	public: "PUBLIC",
};

export const createMemoFn = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => {
		const { content, payload, visibility } = input as {
			content: string;
			payload: Record<string, unknown>;
			visibility: string;
		};

		if (!content?.trim()) {
			throw new Error("Content is required");
		}

		if (payload !== undefined && (typeof payload !== "object" || payload === null || Array.isArray(payload))) {
			throw new Error("Payload must be a plain object");
		}

		return { content, payload, visibility };
	})
	.handler(async ({ data }) => {
		const [{ createDb }, { memo }, { createAuth }, { getRequestHeaders }] =
			await Promise.all([
				import("@memos/db"),
				import("@memos/db/schema/memo.table"),
				import("@memos/auth"),
				import("@tanstack/react-start/server"),
			]);

		const headers = getRequestHeaders();
		const session = await createAuth().api.getSession({ headers });
		if (!session) {
			throw new Error("Not authenticated");
		}

		const db = createDb();

		let created: typeof memo.$inferSelect;
		try {
			[created] = await db
				.insert(memo)
				.values({
					uid: crypto.randomUUID(),
					creatorId: session.user.id,
					content: data.content,
					payload: data.payload ?? {},
					visibility: visibilityMap[data.visibility] ?? "PRIVATE",
				})
				.returning();
		} catch (error) {
			console.error("Failed to create memo:", error);
			throw new Error("Failed to create memo");
		}

		return {
			id: created.id,
			uid: created.uid,
			creatorId: created.creatorId,
			content: created.content,
			visibility: created.visibility,
			rowStatus: created.rowStatus,
			pinned: created.pinned,
			tags: created.tags,
			createdAt: created.createdAt.toISOString(),
			updatedAt: created.updatedAt.toISOString(),
		};
	});
