import { Server, Socket } from 'socket.io';

// Store timers as Map<"from:to", Timeout>
const typingTimers = new Map<string, NodeJS.Timeout>();

const REMOTE_STOP_DELAY = 3000; // 3 seconds

export function registerTypingEvents(io: Server, socket: Socket) {
  const userId = (socket as any).userId;
  if (!userId) return;

  const keyFor = (toUserId: string) => `${userId}:${toUserId}`;

  const clearTypingTimer = (key: string) => {
    const existing = typingTimers.get(key);
    if (existing) {
      clearTimeout(existing);
      typingTimers.delete(key);
    }
  };

  // -------------------------------------------------------
  // USER IS TYPING
  // -------------------------------------------------------
  socket.on('typing', ({ toUserId }) => {
    if (!toUserId) return;

    const key = keyFor(toUserId);

    // Emit typing immediately
    io.to(toUserId).emit('typing', { from: userId });

    // Reset old timer
    clearTypingTimer(key);

    // // Start a new 3-second timeout
    const timer = setTimeout(() => {
      io.to(toUserId).emit('stop_typing', { from: userId });
      typingTimers.delete(key);
    }, REMOTE_STOP_DELAY);

    typingTimers.set(key, timer);
  });

  // -------------------------------------------------------
  // CLIENT EXPLICITLY SENDS STOP TYPING
  // -------------------------------------------------------
  socket.on('stop_typing', ({ toUserId }) => {
    if (!toUserId) return;

    const key = keyFor(toUserId);

    clearTypingTimer(key);

    io.to(toUserId).emit('stop_typing', { from: userId });
  });

  // -------------------------------------------------------
  // CLEAN UP ON DISCONNECT
  // -------------------------------------------------------
  socket.on('disconnect', () => {
    for (const [key, timer] of typingTimers.entries()) {
      if (key.startsWith(`${userId}:`)) {
        clearTimeout(timer);
        typingTimers.delete(key);
      }
    }
  });
}
