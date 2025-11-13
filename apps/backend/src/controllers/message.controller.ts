import { prisma } from '@workspace/database';
import { Request, Response } from 'express';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { recipientId, message } = req.body;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and message are required',
      });
    }

    // Check if users are friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: user.id, userBId: recipientId },
          { userAId: recipientId, userBId: user.id },
        ],
      },
    });

    if (!friendship) {
      return res.status(403).json({
        success: false,
        message: 'You can only send messages to friends',
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        content: message,
        senderId: user.id,
        recipientId,
      },
    });

    return res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { friendId } = req.params;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Check if users are friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: user.id, userBId: friendId },
          { userAId: friendId, userBId: user.id },
        ],
      },
    });

    if (!friendship) {
      return res.status(403).json({
        success: false,
        message: 'You can only view messages from friends',
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, recipientId: friendId },
          { senderId: friendId, recipientId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: friendId,
        recipientId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    const formatted = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      createdAt: msg.createdAt,
      isOwn: msg.senderId === user.id,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const unreadCount = await prisma.message.count({
      where: {
        recipientId: user.id,
        isRead: false,
      },
    });

    return res.status(200).json({ success: true, data: { count: unreadCount } });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
