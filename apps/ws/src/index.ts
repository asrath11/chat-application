import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { registerMessageEvents } from './events/messageEvents';
import { registerFriendEvents } from './events/friendEvents';
import { registerTypingEvents } from './events/typingEvents';
import dotenv from 'dotenv';

dotenv.config();

// -------------------- HTTP SERVER --------------------
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
});

// -------------------- REDIS (UPSTASH) --------------------
const pubClient = new Redis(process.env.REDIS_URL!);

const subClient = pubClient.duplicate();

pubClient.on('connect', () => console.log('🔌 Redis pubClient connected'));
subClient.on('connect', () => console.log('🔌 Redis subClient connected'));

pubClient.on('error', (err) => console.error('Redis pubClient error:', err));
subClient.on('error', (err) => console.error('Redis subClient error:', err));

io.adapter(createAdapter(pubClient, subClient));

// -------------------- AUTH MIDDLEWARE --------------------
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error('Auth token missing'));

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    (socket as any).userId = payload.userId;

    // Join personal user room
    socket.join(payload.userId);

    console.log(`🔑 Auth success for user: ${payload.userId}`);
    next();
  } catch (error) {
    console.error('JWT Error:', error);
    next(new Error('Invalid or expired JWT'));
  }
});

// -------------------- CONNECTION -------------------------
io.on('connection', (socket) => {
  const userId = (socket as any).userId;

  console.log(`⚡ User connected: ${userId}`);

  // Register event handlers
  registerMessageEvents(io, socket);
  registerFriendEvents(io, socket);
  registerTypingEvents(io, socket);

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${userId}`);
  });
});

// -------------------- SERVER START -----------------------
const PORT = process.env.WS_PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on ws://localhost:${PORT}`);
});
