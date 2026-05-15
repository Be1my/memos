import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.table";
import { inboxStatusEnum } from "./enums";

export const inbox = pgTable(
	"inbox",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		senderId: text("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		receiverId: text("receiver_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: inboxStatusEnum("status").notNull().default("UNREAD"),
		message: text("message").notNull().default(""),
	},
	(table) => [
		index("inbox_receiver_id_idx").on(table.receiverId),
		index("inbox_sender_id_idx").on(table.senderId),
		index("inbox_status_idx").on(table.status),
		index("inbox_receiver_status_idx").on(
			table.receiverId,
			table.status,
			table.createdAt,
		),
	],
);
