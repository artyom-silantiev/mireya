-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('OTHER', 'IMAGE', 'VIDEO', 'AUDIO');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DbFileRef" (
    "id" BIGSERIAL NOT NULL,
    "uid" VARCHAR(24) NOT NULL,
    "fileId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DbFileRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DbFile" (
    "id" BIGSERIAL NOT NULL,
    "mime" VARCHAR(255) NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationSec" INTEGER,
    "pathToFile" VARCHAR(255) NOT NULL,
    "type" "MediaType" NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DbFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DbFileRef_uid_key" ON "DbFileRef"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "DbFile_sha256_key" ON "DbFile"("sha256");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "DbFileRef"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DbFileRef" ADD CONSTRAINT "DbFileRef_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "DbFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
