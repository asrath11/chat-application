import { Server, Socket } from 'socket.io';

export function registerFriendEvents(io: Server, socket: Socket) {
  socket.on('friend_request_sent', (data) => {
    // Emit to recipient (Socket.IO adapter handles Redis pub/sub automatically)
    io.to(data.toUserId).emit('friend_request_received', data);
  });

  socket.on('friend_request_accepted', (data) => {
    // Emit to both users (Socket.IO adapter handles Redis pub/sub automatically)
    io.to(data.userId).emit('friend_request_accepted', data);
  });
}
