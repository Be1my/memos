import { createDb } from "@memos/db";
import { memo } from "@memos/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { notFound, unauthorized } from "@/lib/errors";
import { authMiddleware } from "@/middleware/auth";

import { TogglePinInputSchema } from "../schemas/toggle-pin";

export const togglePinFn = createServerFn({ method: "POST" })
	.inputValidator(TogglePinInputSchema)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			throw unauthorized();
		}

		const db = createDb();

		const [updated] = await db
			.update(memo)
			.set({ pinned: sql`NOT ${memo.pinned}` })
			.where(
				and(
					eq(memo.uid, data.memoId),
					eq(memo.creatorId, context.session.user.id),
				),
			)
			.returning({ uid: memo.uid, pinned: memo.pinned });

		if (!updated) {
			throw notFound("Memo not found");
		}

		return updated;
	});
