import { pgTable, text } from "drizzle-orm/pg-core";

export const systemSetting = pgTable("system_setting", {
	name: text("name").primaryKey(),
	value: text("value").notNull(),
	description: text("description").notNull().default(""),
});
