CREATE TYPE "idp_type" AS ENUM('OAUTH2', 'OIDC');--> statement-breakpoint
CREATE TYPE "inbox_status" AS ENUM('UNREAD', 'READ');--> statement-breakpoint
CREATE TYPE "memo_relation_type" AS ENUM('REFERENCE', 'COMMENT');--> statement-breakpoint
CREATE TYPE "memo_visibility" AS ENUM('PRIVATE', 'PUBLIC', 'PROTECTED');--> statement-breakpoint
CREATE TYPE "row_status" AS ENUM('NORMAL', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "storage_type" AS ENUM('S3', 'R2', 'GCS', 'LOCAL');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('USER', 'ADMIN', 'HOST');--> statement-breakpoint
CREATE TABLE "attachment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attachment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" text NOT NULL UNIQUE,
	"creator_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"filename" text DEFAULT '' NOT NULL,
	"type" text DEFAULT '' NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"external_url" text DEFAULT '' NOT NULL,
	"memo_id" integer,
	"storage_type" "storage_type" DEFAULT 'S3'::"storage_type" NOT NULL,
	"reference" text DEFAULT '' NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"username" varchar(255) UNIQUE,
	"display_username" text,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"image" text,
	"nickname" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"row_status" "row_status" DEFAULT 'NORMAL'::"row_status" NOT NULL,
	"role" "user_role" DEFAULT 'USER'::"user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idp" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "idp_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" text NOT NULL UNIQUE,
	"name" text DEFAULT '' NOT NULL,
	"type" "idp_type" DEFAULT 'OAUTH2'::"idp_type" NOT NULL,
	"identifier_filter" text DEFAULT '' NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbox" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inbox_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"status" "inbox_status" DEFAULT 'UNREAD'::"inbox_status" NOT NULL,
	"message" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" text NOT NULL UNIQUE,
	"creator_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_status" "row_status" DEFAULT 'NORMAL'::"row_status" NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"visibility" "memo_visibility" DEFAULT 'PRIVATE'::"memo_visibility" NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memo_relation" (
	"memo_id" integer,
	"related_memo_id" integer,
	"type" "memo_relation_type",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memo_relation_pkey" PRIMARY KEY("memo_id","related_memo_id","type")
);
--> statement-breakpoint
CREATE TABLE "memo_share" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memo_share_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" text NOT NULL UNIQUE,
	"memo_id" integer NOT NULL,
	"creator_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reaction" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reaction_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"creator_id" text NOT NULL,
	"content_id" text NOT NULL,
	"reaction_type" text NOT NULL,
	CONSTRAINT "uq_reaction" UNIQUE("creator_id","content_id","reaction_type")
);
--> statement-breakpoint
CREATE TABLE "system_setting" (
	"name" text PRIMARY KEY,
	"value" text NOT NULL,
	"description" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_identity" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_identity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"extern_uid" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_user_identity_provider" UNIQUE("provider","extern_uid"),
	CONSTRAINT "uq_user_identity_user_provider" UNIQUE("user_id","provider")
);
--> statement-breakpoint
CREATE TABLE "user_setting" (
	"user_id" text,
	"key" text,
	"value" text DEFAULT '' NOT NULL,
	CONSTRAINT "user_setting_pkey" PRIMARY KEY("user_id","key")
);
--> statement-breakpoint
CREATE INDEX "attachment_creator_id_idx" ON "attachment" ("creator_id");--> statement-breakpoint
CREATE INDEX "attachment_memo_id_idx" ON "attachment" ("memo_id");--> statement-breakpoint
CREATE INDEX "attachment_uid_idx" ON "attachment" ("uid");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "idp_type_idx" ON "idp" ("type");--> statement-breakpoint
CREATE INDEX "idp_name_idx" ON "idp" ("name");--> statement-breakpoint
CREATE INDEX "inbox_receiver_id_idx" ON "inbox" ("receiver_id");--> statement-breakpoint
CREATE INDEX "inbox_sender_id_idx" ON "inbox" ("sender_id");--> statement-breakpoint
CREATE INDEX "inbox_status_idx" ON "inbox" ("status");--> statement-breakpoint
CREATE INDEX "inbox_receiver_status_idx" ON "inbox" ("receiver_id","status","created_at");--> statement-breakpoint
CREATE INDEX "memo_creator_id_idx" ON "memo" ("creator_id");--> statement-breakpoint
CREATE INDEX "memo_created_at_idx" ON "memo" ("created_at");--> statement-breakpoint
CREATE INDEX "memo_visibility_idx" ON "memo" ("visibility");--> statement-breakpoint
CREATE INDEX "memo_row_status_idx" ON "memo" ("row_status");--> statement-breakpoint
CREATE INDEX "memo_creator_visibility_idx" ON "memo" ("creator_id","visibility","created_at");--> statement-breakpoint
CREATE INDEX "memo_tags_gin" ON "memo" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "memo_relation_memo_id_idx" ON "memo_relation" ("memo_id");--> statement-breakpoint
CREATE INDEX "memo_relation_related_memo_id_idx" ON "memo_relation" ("related_memo_id");--> statement-breakpoint
CREATE INDEX "memo_share_memo_id_idx" ON "memo_share" ("memo_id");--> statement-breakpoint
CREATE INDEX "memo_share_creator_id_idx" ON "memo_share" ("creator_id");--> statement-breakpoint
CREATE INDEX "reaction_content_id_idx" ON "reaction" ("content_id");--> statement-breakpoint
CREATE INDEX "reaction_creator_id_idx" ON "reaction" ("creator_id");--> statement-breakpoint
CREATE INDEX "reaction_content_type_idx" ON "reaction" ("content_id","reaction_type");--> statement-breakpoint
CREATE INDEX "user_identity_user_id_idx" ON "user_identity" ("user_id");--> statement-breakpoint
CREATE INDEX "user_identity_provider_idx" ON "user_identity" ("provider");--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_creator_id_user_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_memo_id_memo_id_fkey" FOREIGN KEY ("memo_id") REFERENCES "memo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_sender_id_user_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_receiver_id_user_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memo" ADD CONSTRAINT "memo_creator_id_user_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memo_relation" ADD CONSTRAINT "memo_relation_memo_id_memo_id_fkey" FOREIGN KEY ("memo_id") REFERENCES "memo"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memo_relation" ADD CONSTRAINT "memo_relation_related_memo_id_memo_id_fkey" FOREIGN KEY ("related_memo_id") REFERENCES "memo"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memo_share" ADD CONSTRAINT "memo_share_memo_id_memo_id_fkey" FOREIGN KEY ("memo_id") REFERENCES "memo"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memo_share" ADD CONSTRAINT "memo_share_creator_id_user_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reaction" ADD CONSTRAINT "reaction_creator_id_user_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_identity" ADD CONSTRAINT "user_identity_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;