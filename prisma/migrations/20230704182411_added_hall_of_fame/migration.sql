-- CreateTable
CREATE TABLE "HallOfFame" (
    "gid" VARCHAR NOT NULL,
    "halls" TEXT[],

    CONSTRAINT "HallOfFame_pkey" PRIMARY KEY ("gid")
);
