import { Server, Socket } from 'socket.io';
import { prisma } from '@workspace/database';
// import Redis from 'ioredis';

// // Separate Redis clients for pub/sub
// const pubClient = new Redis(process.env.REDIS_URL!);
// const subClient = new Redis(process.env.REDIS_URL!);

// // Subscribe once when module loads
// subClient.subscribe('messages', () => {
//   console.log('📬 Subscribed to messages channel');
// });

// subClient.on('message', (_channel, msg) => {
//   // This will be handled by Socket.IO adapter
//   // No need to manually emit here as the adapter handles it
// });

export function registerMessageEvents(io: Server, socket: Socket) {
  // user sends a message
  socket.on('send_message', async (data) => {
    const { toUserId, message, id, createdAt } = data;
    const fromUserId = (socket as any).userId;

    const messageData = {
      id: id || Date.now().toString(),
      fromUserId,
      toUserId,
      message,
      createdAt: createdAt || new Date().toISOString(),
    };

    // Emit to recipient (Socket.IO adapter handles Redis pub/sub automatically)
    io.to(toUserId).emit('receive_message', messageData);
  });

  // user reads messages (when viewing chat)
  socket.on('messages_read', async (data) => {
    const { friendId } = data;
    const userId = (socket as any).userId;

    try {
      // Mark all messages from friendId to userId as read
      await prisma.message.updateMany({
        where: {
          senderId: friendId,
          recipientId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      // Notify the sender that their messages were read
      io.to(friendId).emit('messages_read', { friendId: userId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });
}
