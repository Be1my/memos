import { memo } from "@/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { notFound } from "@/lib/errors";
import { coreMiddleware } from "@/middleware";
import { UnauthorizedError } from "@/lib/errors";

import { TogglePinInputSchema } from "../schemas/toggle-pin";

export const togglePinFn = createServerFn({ method: "POST" })
	.inputValidator(TogglePinInputSchema)
	.middleware([coreMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			throw new UnauthorizedError();
		}
		const db = context.db;

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