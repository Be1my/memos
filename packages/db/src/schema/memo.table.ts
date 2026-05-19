import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth.table";
import { memoVisibilityEnum, rowStatusEnum } from "./enums";

export const memo = pgTable(
	"memo",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		uid: text("uid").notNull().unique(),
		creatorId: text("creator_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		rowStatus: rowStatusEnum("row_status").notNull().default("NORMAL"),
		content: text("content").notNull().default(""),
		visibility: memoVisibilityEnum("visibility").notNull().default("PRIVATE"),
		pinned: boolean("pinned").notNull().default(false),
		tags: text("tags").array().notNull().default([]),
		payload: jsonb("payload")
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
	},
	(table) => [
		index("memo_creator_id_idx").on(table.creatorId),
		index("memo_created_at_idx").on(table.createdAt),
		index("memo_visibility_idx").on(table.visibility),
		index("memo_row_status_idx").on(table.rowStatus),
		index("memo_creator_visibility_idx").on(
			table.creatorId,
			table.visibility,
			table.createdAt,
		),
		index("memo_tags_gin").using("gin", table.tags),
	],
);
