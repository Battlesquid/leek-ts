/*
  Warnings:

  - You are about to drop the `imageboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `log_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verify_entry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verify_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "imageboard";

-- DropTable
DROP TABLE "log_settings";

-- DropTable
DROP TABLE "logs";

-- DropTable
DROP TABLE "verify_entry";

-- DropTable
DROP TABLE "verify_settings";

-- CreateTable
CREATE TABLE "Imageboard" (
    "gid" VARCHAR NOT NULL,
    "boards" TEXT[],
    "whitelist" TEXT[],

    CONSTRAINT "Imageboard_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "LogSettings" (
    "gid" VARCHAR NOT NULL,
    "text" VARCHAR,
    "image" VARCHAR,
    "moderation" VARCHAR,

    CONSTRAINT "LogSettings_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "Logs" (
    "timestamp" TEXT NOT NULL,
    "data" VARCHAR,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("timestamp")
);

-- CreateTable
CREATE TABLE "VerifyEntry" (
    "gid" VARCHAR NOT NULL,
    "uid" VARCHAR NOT NULL,
    "nick" VARCHAR(32) NOT NULL,

    CONSTRAINT "uid_gid_pkey" PRIMARY KEY ("uid","gid")
);

-- CreateTable
CREATE TABLE "VerifySettings" (
    "gid" VARCHAR NOT NULL,
    "join_ch" VARCHAR,
    "roles" TEXT[],
    "autogreet" BOOLEAN,

    CONSTRAINT "VerifySettings_pkey" PRIMARY KEY ("gid")
);
