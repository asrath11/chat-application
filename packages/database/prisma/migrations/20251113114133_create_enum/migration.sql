/*
  Warnings:

  - The `status` column on the `FriendRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('pending', 'accepted', 'declined');

-- AlterTable
ALTER TABLE "FriendRequest" DROP COLUMN "status",
ADD COLUMN     "status" "FriendRequestStatus" NOT NULL DEFAULT 'pending';
