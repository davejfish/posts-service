/*
  Warnings:

  - You are about to drop the column `title` on the `post` table. All the data in the column will be lost.
  - Made the column `content` on table `post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "title",
ALTER COLUMN "content" SET NOT NULL;
