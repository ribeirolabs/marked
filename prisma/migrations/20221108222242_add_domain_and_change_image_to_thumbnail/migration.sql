/*
  Warnings:

  - You are about to drop the column `image` on the `Mark` table. All the data in the column will be lost.
  - Added the required column `domain` to the `Mark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Mark` DROP COLUMN `image`,
    ADD COLUMN `domain` VARCHAR(191) NOT NULL,
    ADD COLUMN `thumbnail` VARCHAR(191) NULL;
