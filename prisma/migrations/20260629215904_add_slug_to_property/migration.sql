/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
