-- DropForeignKey
ALTER TABLE "LabelsOnPosts" DROP CONSTRAINT "LabelsOnPosts_labelId_fkey";

-- DropForeignKey
ALTER TABLE "LabelsOnPosts" DROP CONSTRAINT "LabelsOnPosts_postId_fkey";

-- AddForeignKey
ALTER TABLE "LabelsOnPosts" ADD CONSTRAINT "LabelsOnPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelsOnPosts" ADD CONSTRAINT "LabelsOnPosts_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
