/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `email`,
    MODIFY `name` VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE INDEX `Task_authorId_idx` ON `Task`(`authorId`);
