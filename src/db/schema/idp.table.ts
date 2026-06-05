import { index, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { idpTypeEnum } from "./enums";

export const idp = pgTable(
	"idp",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		uid: text("uid").notNull().unique(),
		name: text("name").notNull().default(""),
		type: idpTypeEnum("type").notNull().default("OAUTH2"),
		identifierFilter: text("identifier_filter").notNull().default(""),
		config: jsonb("config")
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
	},
	(table) => [
		index("idp_type_idx").on(table.type),
		index("idp_name_idx").on(table.name),
	],
);
