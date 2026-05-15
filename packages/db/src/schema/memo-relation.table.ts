import {
	index,
	integer,
	pgTable,
	primaryKey,
	timestamp,
} from "drizzle-orm/pg-core";
import { memoRelationTypeEnum } from "./enums";
import { memo } from "./memo.table";

export const memoRelation = pgTable(
	"memo_relation",
	{
		memoId: integer("memo_id")
			.notNull()
			.references(() => memo.id, { onDelete: "cascade" }),
		relatedMemoId: integer("related_memo_id")
			.notNull()
			.references(() => memo.id, { onDelete: "cascade" }),
		type: memoRelationTypeEnum("type").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		primaryKey({ columns: [table.memoId, table.relatedMemoId, table.type] }),
		index("memo_relation_memo_id_idx").on(table.memoId),
		index("memo_relation_related_memo_id_idx").on(table.relatedMemoId),
	],
);
