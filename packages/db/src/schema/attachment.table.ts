import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth.table";
import { storageTypeEnum } from "./enums";
import { memo } from "./memo.table";

export const attachment = pgTable(
	"attachment",
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
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		filename: text("filename").notNull().default(""),
		type: text("type").notNull().default(""),
		size: integer("size").notNull().default(0),
		externalUrl: text("external_url").notNull().default(""),
		memoId: integer("memo_id").references(() => memo.id, {
			onDelete: "set null",
		}),
		storageType: storageTypeEnum("storage_type").notNull().default("S3"),
		reference: text("reference").notNull().default(""),
		payload: jsonb("payload")
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
	},
	(table) => [
		index("attachment_creator_id_idx").on(table.creatorId),
		index("attachment_memo_id_idx").on(table.memoId),
		index("attachment_uid_idx").on(table.uid),
	],
);
