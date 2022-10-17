-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TECHNICAL', 'READING');

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "category" "Category" NOT NULL,
    "title" TEXT NOT NULL,
    "Introduction" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
