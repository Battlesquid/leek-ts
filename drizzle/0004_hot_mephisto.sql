ALTER TABLE "verify_entry" DROP CONSTRAINT "verify_entry_pkey";
ALTER TABLE "verify_entry" ADD CONSTRAINT "verify_entry_gid_uid_pk" PRIMARY KEY("gid","uid");--> statement-breakpoint
ALTER TABLE "verify_entry" DROP COLUMN IF EXISTS "id";