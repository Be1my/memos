import { createServerFn } from "@tanstack/react-start";

export const togglePinFn = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => {
		const data = input as { memoId: string };
		if (!data.memoId) {
			throw new Error("memoId is required");
		}
		return data;
	})
	.handler(async ({ data }) => {
		const [
			{ createDb },
			{ memo },
			{ createAuth },
			{ getRequestHeaders },
			{ eq, and, sql },
		] = await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/memo.table"),
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

		const [updated] = await db
			.update(memo)
			.set({ pinned: sql`NOT ${memo.pinned}` })
			.where(and(eq(memo.uid, data.memoId), eq(memo.creatorId, session.user.id)))
			.returning({ uid: memo.uid, pinned: memo.pinned });

		if (!updated) {
			throw new Error("Memo not found or not authorized");
		}

		return updated;
	});
