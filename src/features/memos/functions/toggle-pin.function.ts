import { memo } from "@/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { notFound } from "@/lib/errors";
import { authMiddleware } from "@/middleware";

import { TogglePinInputSchema } from "../schemas/toggle-pin";

export const togglePinFn = createServerFn({ method: "POST" })
	.inputValidator(TogglePinInputSchema)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		const db = context.db;

		const [updated] = await db
			.update(memo)
			.set({ pinned: sql`NOT ${memo.pinned}` })
			.where(
				and(
					eq(memo.uid, data.memoId),
					eq(memo.creatorId, context.user.id),
				),
			)
			.returning({ uid: memo.uid, pinned: memo.pinned });

		if (!updated) {
			throw notFound("Memo not found");
		}

		return updated;
	});