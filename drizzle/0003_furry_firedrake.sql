ALTER TABLE "channel_settings" RENAME TO "imageboard";--> statement-breakpoint
ALTER TABLE "imageboard" RENAME COLUMN "media_only" TO "boards";--> statement-breakpoint
ALTER TABLE "imageboard" RENAME COLUMN "exempted_roles" TO "whitelist";