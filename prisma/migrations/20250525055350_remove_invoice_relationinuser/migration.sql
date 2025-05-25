/*
  Warnings:

  - You are about to drop the column `userId` on the `invoices` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_userId_fkey";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "userId";
