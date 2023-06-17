-- CreateTable
CREATE TABLE "channel_settings" (
    "gid" VARCHAR NOT NULL,
    "media_only" TEXT[],
    "exempted_roles" TEXT[],

    CONSTRAINT "channel_settings_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "log_settings" (
    "gid" VARCHAR NOT NULL,
    "t_log_ch" VARCHAR,
    "i_log_ch" VARCHAR,

    CONSTRAINT "log_settings_pkey" PRIMARY KEY ("gid")
);

-- CreateTable
CREATE TABLE "logs" (
    "timestamp" TEXT NOT NULL,
    "data" VARCHAR,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("timestamp")
);

-- CreateTable
CREATE TABLE "verify_entry" (
    "id" SERIAL NOT NULL,
    "gid" VARCHAR NOT NULL,
    "uid" VARCHAR NOT NULL,
    "nick" VARCHAR(32) NOT NULL,

    CONSTRAINT "verify_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verify_settings" (
    "gid" VARCHAR NOT NULL,
    "join_ch" VARCHAR,
    "roles" TEXT[],
    "autogreet" BOOLEAN,

    CONSTRAINT "verify_settings_pkey" PRIMARY KEY ("gid")
);

