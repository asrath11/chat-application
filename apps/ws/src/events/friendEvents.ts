import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export function registerFriendEvents(io: Server, socket: Socket) {
  socket.on('friend_request_sent', (data) => {
    io.to(data.toUserId).emit('friend_request_received', data);

    redis.publish('friend_events', JSON.stringify({ type: 'request', ...data }));
  });

  socket.on('friend_request_accepted', (data) => {
    io.to(data.userId).emit('friend_request_accepted', data);

    redis.publish('friend_events', JSON.stringify({ type: 'accepted', ...data }));
  });

  // listen to external events
  redis.subscribe('friend_events', () => {});
  redis.on('message', (_channel, msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'request') {
      io.to(data.toUserId).emit('friend_request_received', data);
    }

    if (data.type === 'accepted') {
      io.to(data.userA).emit('friend_request_accepted', data);
      io.to(data.userB).emit('friend_request_accepted', data);
    }
  });
}
