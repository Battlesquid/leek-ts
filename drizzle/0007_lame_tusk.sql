ALTER TABLE "verify_settings" ALTER COLUMN "type" SET DEFAULT 'message';
UPDATE "verify_settings" SET "type"='message';