/*
  Warnings:

  - You are about to drop the column `code` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `UserCard` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "UserCard" DROP CONSTRAINT "UserCard_roomId_fkey";

-- DropForeignKey
ALTER TABLE "UserCard" DROP CONSTRAINT "UserCard_userId_fkey";

-- DropIndex
DROP INDEX "Room_code_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "code",
DROP COLUMN "createdBy",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "UserCard";

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "min" INTEGER NOT NULL DEFAULT 1,
    "max" INTEGER NOT NULL DEFAULT 5,
    "mid" INTEGER NOT NULL DEFAULT 1,
    "roomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "voteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_userId_voteId_key" ON "Card"("userId", "voteId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
