/*
  Warnings:

  - You are about to drop the column `access` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "access";

-- CreateTable
CREATE TABLE "Access" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(255) NOT NULL,

    CONSTRAINT "Access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessOnUsers" (
    "userId" INTEGER NOT NULL,
    "accessId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" VARCHAR(255) NOT NULL,

    CONSTRAINT "AccessOnUsers_pkey" PRIMARY KEY ("userId","accessId")
);

-- AddForeignKey
ALTER TABLE "AccessOnUsers" ADD CONSTRAINT "AccessOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessOnUsers" ADD CONSTRAINT "AccessOnUsers_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;
