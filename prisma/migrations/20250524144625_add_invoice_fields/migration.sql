/*
  Warnings:

  - Added the required column `userId` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidAmount` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "paidAmount" DECIMAL(10,2) NOT NULL;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
