/*
  Warnings:

  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UserCard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Card` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationCode` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,cardId,roomId]` on the table `UserCard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `value` to the `UserCard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_userId_fkey";

-- DropForeignKey
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserCard" DROP CONSTRAINT "UserCard_cardId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationCode" DROP CONSTRAINT "VerificationCode_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified";

-- AlterTable
ALTER TABLE "UserCard" DROP CONSTRAINT "UserCard_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL,
ADD CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Card";

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "RoomUser";

-- DropTable
DROP TABLE "VerificationCode";

-- CreateTable
CREATE TABLE "UserRoom" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',

    CONSTRAINT "UserRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRoom_roomId_userId_key" ON "UserRoom"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCard_userId_cardId_roomId_key" ON "UserCard"("userId", "cardId", "roomId");

-- AddForeignKey
ALTER TABLE "UserRoom" ADD CONSTRAINT "UserRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoom" ADD CONSTRAINT "UserRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
