/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Access` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Access_name_key" ON "Access"("name");
