/*
  Warnings:

  - You are about to drop the column `content` on the `Access` table. All the data in the column will be lost.
  - Added the required column `name` to the `Access` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Access" DROP COLUMN "content",
ADD COLUMN     "name" VARCHAR(255) NOT NULL;
