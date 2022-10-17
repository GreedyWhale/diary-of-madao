/*
  Warnings:

  - You are about to drop the column `Introduction` on the `Note` table. All the data in the column will be lost.
  - Added the required column `introduction` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "Introduction",
ADD COLUMN     "introduction" TEXT NOT NULL;
