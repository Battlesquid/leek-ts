-- CreateTable
CREATE TABLE "imageboard" (
    "gid" VARCHAR NOT NULL,
    "boards" TEXT[],
    "whitelist" TEXT[],

    CONSTRAINT "imageboard_pkey" PRIMARY KEY ("gid")
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
    "gid" VARCHAR NOT NULL,
    "uid" VARCHAR NOT NULL,
    "nick" VARCHAR(32) NOT NULL,

    CONSTRAINT "uid_gid_pkey" PRIMARY KEY ("uid","gid")
);

-- CreateTable
CREATE TABLE "verify_settings" (
    "gid" VARCHAR NOT NULL,
    "join_ch" VARCHAR,
    "roles" TEXT[],
    "autogreet" BOOLEAN,

    CONSTRAINT "verify_settings_pkey" PRIMARY KEY ("gid")
);
