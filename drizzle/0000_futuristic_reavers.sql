CREATE TABLE IF NOT EXISTS "channel_settings" (
	"gid" varchar PRIMARY KEY NOT NULL,
	"media_only" text[] NOT NULL,
	"exempted_roles" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "log_settings" (
	"gid" varchar PRIMARY KEY NOT NULL,
	"t_log_ch" varchar,
	"i_log_ch" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verify_entry" (
	"id" serial PRIMARY KEY NOT NULL,
	"gid" varchar NOT NULL,
	"uid" varchar NOT NULL,
	"nick" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verify_settings" (
	"gid" varchar NOT NULL,
	"join_ch" varchar NOT NULL,
	"roles" text[] NOT NULL,
	"autogreet" boolean DEFAULT false NOT NULL
);
