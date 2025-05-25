-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
