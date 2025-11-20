import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useFriendStore } from '@/stores/friendStore';
import { useFriendRequestStore } from '@/stores/friendRequestStore';
import { friendService } from './friend.service';

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor() {}

  connect(token: string): Socket {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

    this.socket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    this.setupConnectionListeners();
    this.setupEventListeners();

    return this.socket;
  }

  private setupConnectionListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        toast.error('Connection Error', {
          description:
            'Unable to connect to chat server. Please refresh the page.',
        });
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      toast.success('Reconnected', {
        description: 'Connection to chat server restored.',
      });
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Friend Request Received
    this.on('friend_request_received', (data: any) => {
      console.log('🔥 friend_request_received:', data);

      useFriendRequestStore.getState().addReceivedRequest({
        id: data.requestId,
        name: data.senderName,
        username: data.senderUsername,
        avatar: data.senderAvatar || '',
        status: 'pending',
      });

      toast.info('New Friend Request', {
        description: `${data.senderName} (@${data.senderUsername}) sent you a friend request`,
      });
    });

    // Friend Request Accepted
    this.on('friend_request_accepted', async (data: any) => {
      console.log('🎉 friend_request_accepted:', data);

      try {
        // Fetch updated friends list
        const updatedFriends = await friendService.getFriends();
        useFriendStore.getState().setFriends(updatedFriends);
        useFriendRequestStore.getState().removeRequest(data.requestId);

        toast.success('Friend Request Accepted', {
          description: `You are now friends with ${data.recipientName}`,
        });
      } catch (error) {
        console.error('Error fetching updated friends:', error);

        // Fallback: add with partial data
        useFriendStore.getState().addFriend({
          id: data.recipientId,
          name: data.recipientName,
          username: '',
          avatar: data.recipientAvatar || '',
          lastMessage: '',
          unread: 0,
          time: new Date().toISOString(),
        });
        useFriendRequestStore.getState().removeRequest(data.requestId);
      }
    });

    // Friend Request Declined
    this.on('friend_request_declined', (data: any) => {
      console.log('❌ friend_request_declined:', data);

      useFriendRequestStore
        .getState()
        .updateSentRequestStatus(data.requestId, 'declined');

      toast.info('Friend Request Declined', {
        description: `${data.recipientName} declined your friend request`,
      });
    });

    // Message Received
    this.on('receive_message', (msg: any) => {
      console.log('💬 receive_message:', msg);

      const { selectedFriend, friends } = useFriendStore.getState();

      // Check if this friend exists in the store
      const friendExists = friends.some((f) => f.id === msg.fromUserId);

      if (!friendExists) {
        console.warn('⚠️ Received message from unknown friend:', msg.fromUserId);
        return;
      }

      // Update last message and timestamp
      useFriendStore
        .getState()
        .updateLastMessage(msg.fromUserId, msg.message, msg.createdAt);

      // Only increment unread if not currently viewing this chat
      if (selectedFriend?.id !== msg.fromUserId) {
        useFriendStore.getState().incrementUnread(msg.fromUserId);
      }
    });

    // Messages Read
    this.on('messages_read', ({ friendId }: { friendId: string }) => {
      console.log('👁️ messages read by friend:', friendId);
      useFriendStore.getState().clearUnread(friendId);
    });

    // Typing Indicator
    this.on('typing', ({ from }: { from: string }) => {
      console.log('✏️ typing from:', from);
      useFriendStore.getState().setTypingStatus(from, true);
    });

    // Stop Typing
    this.on('stop_typing', ({ from }: { from: string }) => {
      console.log('🛑 stop typing from:', from);
      useFriendStore.getState().setTypingStatus(from, false);
    });
  }

  emit(event: string, data?: any) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Cannot emit:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected manually');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Convenience emit methods
  emitFriendRequestSent(data: {
    requestId: string;
    recipientId: string;
    senderName: string;
    senderUsername: string;
    senderAvatar?: string;
  }) {
    this.emit('friend_request_sent', data);
  }

  emitFriendRequestAccepted(data: {
    requestId: string;
    senderId: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
  }) {
    this.emit('friend_request_accepted', data);
  }

  emitFriendRequestDeclined(data: {
    requestId: string;
    senderId: string;
    recipientId: string;
    recipientName: string;
  }) {
    this.emit('friend_request_declined', data);
  }

  emitMessage(data: {
    recipientId: string;
    message: string;
    id?: string;
    createdAt?: string;
  }) {
    console.log('📤 Emitting message:', data);
    this.emit('send_message', data);
  }

  emitTyping(recipientId: string) {
    console.log('📤 Emitting typing event to:', recipientId);
    this.emit('typing', { toUserId: recipientId });
  }

  emitStopTyping(recipientId: string) {
    console.log('📤 Emitting stop_typing event to:', recipientId);
    this.emit('stop_typing', { toUserId: recipientId });
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
