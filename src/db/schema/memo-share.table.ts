import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.table";
import { memo } from "./memo.table";

export const memoShare = pgTable(
	"memo_share",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		uid: text("uid").notNull().unique(),
		memoId: integer("memo_id")
			.notNull()
			.references(() => memo.id, { onDelete: "cascade" }),
		creatorId: text("creator_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
	},
	(table) => [
		index("memo_share_memo_id_idx").on(table.memoId),
		index("memo_share_creator_id_idx").on(table.creatorId),
	],
);
