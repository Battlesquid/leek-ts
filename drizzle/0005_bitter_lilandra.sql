ALTER TABLE "verify_settings" RENAME COLUMN "join_ch" TO "welcome_channel";--> statement-breakpoint
ALTER TABLE "verify_settings" RENAME COLUMN "autogreet" TO "create_greeting";--> statement-breakpoint
ALTER TABLE "verify_settings" ALTER COLUMN "welcome_channel" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verify_settings" ADD COLUMN "type" varchar NOT NULL DEFAULT 'message';