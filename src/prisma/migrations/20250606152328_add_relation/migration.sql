/*
  Warnings:

  - You are about to drop the column `acceptConditions` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `qualiCarriere` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "acceptConditions",
DROP COLUMN "password",
DROP COLUMN "qualiCarriere";
