CREATE TABLE IF NOT EXISTS "hall_of_fame" (
	"gid" varchar PRIMARY KEY NOT NULL,
	"halls" text[] DEFAULT '{}'::text[] NOT NULL
);
