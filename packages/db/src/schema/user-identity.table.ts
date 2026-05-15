import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth.table";

export const userIdentity = pgTable(
	"user_identity",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		provider: text("provider").notNull(),
		externUid: text("extern_uid").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		unique("uq_user_identity_provider").on(table.provider, table.externUid),
		unique("uq_user_identity_user_provider").on(table.userId, table.provider),
		index("user_identity_user_id_idx").on(table.userId),
		index("user_identity_provider_idx").on(table.provider),
	],
);
