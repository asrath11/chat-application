import { Server, Socket } from 'socket.io';

export function registerTypingEvents(io: Server, socket: Socket) {
  socket.on('typing', ({ toUserId }) => {
    const from = (socket as any).userId;
    io.to(toUserId).emit('typing', { from });
  });

  socket.on('stop_typing', ({ toUserId }) => {
    const from = (socket as any).userId;
    io.to(toUserId).emit('stop_typing', { from });
  });
}
