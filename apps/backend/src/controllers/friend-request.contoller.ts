import { prisma } from '@workspace/database';
import { Request, Response } from 'express';

/* ----------------------------------------------------
   SEND FRIEND REQUEST
----------------------------------------------------- */

interface SendRequestBody {
  username: string;
}

export const sendFriendRequest = async (
  req: Request<{}, {}, SendRequestBody>,
  res: Response
) => {
  try {
    const { username } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const friend = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true },
    });

    if (!friend) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (friend.id === user.id) {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot send request to yourself' });
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: user.id, userBId: friend.id },
          { userAId: friend.id, userBId: user.id },
        ],
      },
    });

    if (existingFriendship) {
      return res.status(400).json({ success: false, message: 'Already friends' });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        fromId: user.id,
        toId: friend.id,
      },
      select: {
        id: true,
        status: true,
        from: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        to: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    const formatted = {
      id: friendRequest.id,
      name: friendRequest.to.name,
      username: friendRequest.to.username,
      recipientId: friendRequest.to.id,
      fromName: friendRequest.from.name,
      fromUsername: friendRequest.from.username,
      fromAvatar: '',
    };
    return res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data: formatted,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Friend request already sent',
      });
    }

    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/* ----------------------------------------------------
   GET SENT FRIEND REQUESTS
----------------------------------------------------- */
export const getAllSentFriendRequests = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const friendRequests = await prisma.friendRequest.findMany({
      where: { fromId: user.id },
      select: {
        id: true,
        status: true,
        to: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    // ⭐ Transform result to match frontend shape
    const formatted = friendRequests.map((req) => ({
      id: req.id,
      name: req.to.name || req.to.username,
      username: req.to.username,
      status: req.status,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/* ----------------------------------------------------
   GET INCOMING FRIEND REQUESTS
----------------------------------------------------- */

export const getIncomingFriendRequests = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const incoming = await prisma.friendRequest.findMany({
      where: { toId: user.id, status: 'pending' },
      select: {
        id: true,
        status: true,
        from: { select: { id: true, username: true, name: true } },
      },
    });

    const formatted = incoming.map((req) => ({
      id: req.id,
      name: req.from.name,
      username: req.from.username,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/* ----------------------------------------------------
   RESPOND TO FRIEND REQUEST (accept/reject)
----------------------------------------------------- */

interface RespondRequestBody {
  requestId: string;
  action: 'accept' | 'reject';
}

export const respondToFriendRequest = async (
  req: Request<{}, {}, RespondRequestBody>,
  res: Response
) => {
  try {
    const { requestId, action } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.toId !== user.id) {
      return res
        .status(404)
        .json({ success: false, message: 'Request not found' });
    }

    if (action === 'reject') {
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });

      return res.json({ success: true, message: 'Request rejected' });
    }

    // Accept request → Create friendship
    const [updatedRequest, friendship] = await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'accepted' },
        include: {
          from: { select: { id: true, name: true, username: true } },
          to: { select: { id: true, name: true, username: true } },
        },
      }),
      prisma.friendship.create({
        data: { userAId: request.fromId, userBId: request.toId },
      }),
    ]);

    return res.json({
      success: true,
      message: 'Friend request accepted',
      data: {
        friendId: updatedRequest.from.id,
        friendName: updatedRequest.from.name,
        myId: updatedRequest.to.id,
        myName: updatedRequest.to.name,
        myAvatar: '',
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

/* ----------------------------------------------------
   GET FRIENDS LIST
----------------------------------------------------- */

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
        userA: { select: { id: true, username: true } },
        userB: { select: { id: true, username: true } },
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
