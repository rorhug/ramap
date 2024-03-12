/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Cache` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Cache_key_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Cache_key_key" ON "Cache"("key");
