import { pgEnum } from "drizzle-orm/pg-core";

export const rowStatusEnum = pgEnum("row_status", ["NORMAL", "ARCHIVED"]);
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN", "HOST"]);
export const memoVisibilityEnum = pgEnum("memo_visibility", [
	"PRIVATE",
	"PUBLIC",
	"PROTECTED",
]);
export const memoRelationTypeEnum = pgEnum("memo_relation_type", [
	"REFERENCE",
	"COMMENT",
]);
export const inboxStatusEnum = pgEnum("inbox_status", ["UNREAD", "READ"]);
export const idpTypeEnum = pgEnum("idp_type", ["OAUTH2", "OIDC"]);
export const storageTypeEnum = pgEnum("storage_type", [
	"S3",
	"R2",
	"GCS",
	"LOCAL",
]);

export const VISIBILITY_MAP = {
	private: "PRIVATE",
	workspace: "PROTECTED",
	public: "PUBLIC",
} as const satisfies Record<string, "PRIVATE" | "PUBLIC" | "PROTECTED">;

export const VISIBILITY_VALUES = ["private", "workspace", "public"] as const;
