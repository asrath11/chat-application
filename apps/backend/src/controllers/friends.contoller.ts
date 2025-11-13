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

    const formatted = friends.map((f) =>
      f.userA.id === user.id ? f.userB : f.userA
    );

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
