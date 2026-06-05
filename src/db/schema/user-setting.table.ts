import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { user } from "./auth.table";

export const userSetting = pgTable(
	"user_setting",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		key: text("key").notNull(),
		value: text("value").notNull().default(""),
	},
	(table) => [primaryKey({ columns: [table.userId, table.key] })],
);
