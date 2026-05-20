import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

import { TogglePinInputSchema } from "../schemas/toggle-pin";

export const togglePinFn = createServerFn({ method: "POST" })
	.inputValidator(TogglePinInputSchema)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			throw new Error("Not authenticated");
		}

		const [
			{ createDb },
			{ memo },
			{ eq, and, sql },
		] = await Promise.all([
			import("@memos/db"),
			import("@memos/db/schema/memo.table"),
			import("drizzle-orm"),
		]);

		const db = createDb();

		const [updated] = await db
			.update(memo)
			.set({ pinned: sql`NOT ${memo.pinned}` })
			.where(
				and(eq(memo.uid, data.memoId), eq(memo.creatorId, context.session.user.id)),
			)
			.returning({ uid: memo.uid, pinned: memo.pinned });

		if (!updated) {
			throw new Error("Memo not found or not authorized");
		}

		return updated;
	});
