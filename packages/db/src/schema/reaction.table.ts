import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth.table";

export const reaction = pgTable(
	"reaction",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		creatorId: text("creator_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		contentId: text("content_id").notNull(),
		reactionType: text("reaction_type").notNull(),
	},
	(table) => [
		unique("uq_reaction").on(
			table.creatorId,
			table.contentId,
			table.reactionType,
		),
		index("reaction_content_id_idx").on(table.contentId),
		index("reaction_creator_id_idx").on(table.creatorId),
		index("reaction_content_type_idx").on(table.contentId, table.reactionType),
	],
);
