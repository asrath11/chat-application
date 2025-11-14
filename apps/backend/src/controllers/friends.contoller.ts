import { prisma } from '@workspace/database';
import { Request, Response } from 'express';

export const getFriends = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const friends = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: user.id }, { userBId: user.id }],
      },
      select: {
        id: true,
        userA: { select: { id: true, username: true, name: true } },
        userB: { select: { id: true, username: true, name: true } },
      },
    });

    // Get unread message counts and last message for each friend
    const formatted = await Promise.all(
      friends.map(async (f) => {
        const friend = f.userA.id === user.id ? f.userB : f.userA;

        // Count unread messages from this friend
        const unreadCount = await prisma.message.count({
          where: {
            senderId: friend.id,
            recipientId: user.id,
            isRead: false,
          },
        });

        // Get last message between users
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
             
