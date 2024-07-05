ALTER TABLE "log_settings" RENAME COLUMN "t_log_ch" TO "text";--> statement-breakpoint
ALTER TABLE "log_settings" RENAME COLUMN "i_log_ch" TO "image";--> statement-breakpoint
ALTER TABLE "log_settings" ADD COLUMN "moderation" varchar;