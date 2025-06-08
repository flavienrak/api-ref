/*
  Warnings:

  - The primary key for the `UserCard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `roomId` to the `UserCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCard" DROP CONSTRAINT "UserCard_pkey",
ADD COLUMN     "roomId" INTEGER NOT NULL,
ADD CONSTRAINT "UserCard_pkey" PRIMARY KEY ("userId", "cardId", "roomId");

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
