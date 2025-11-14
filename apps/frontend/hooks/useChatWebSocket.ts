import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { Friend, FriendRequest } from '../types/chat.types';

interface UseChatWebSocketProps {
  socket: Socket | null;
  activeChatId?: string;
  onReceivedRequest: (request: FriendRequest) => void;
  onFriendAccepted: (data: {
    requestId: string;
    senderId: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
  }) => void;
  onFriendDeclined: (data: {
    requestId: string;
    senderId: string;
    recipientId: string;
    recipientName: string;
  }) => void;
  onMessage: (msg: any) => void;
  onMessagesRead: (friendId: string) => void;
}

export const useChatWebSocket = ({
  socket,
  activeChatId,
  onReceivedRequest,
  onFriendAccepted,
  onFriendDeclined,
  onMessage,
  onMessagesRead,
}: UseChatWebSocketProps) => {
  const handleFriendRequest = useCallback(
    (data: any) => {
      console.log('🔥 friend_request_received:', data);
      onReceivedRequest({
        id: data.requestId,
        name: data.senderName,
        username: data.senderUsername,
        avatar: data.senderAvatar || '',
        status: 'pending',
      });

      toast.info('New Friend Request', {
        description: `${data.senderName} (@${data.senderUsername}) sent you a friend request`,
      });
    },
    [onReceivedRequest]
  );

  const handleFriendAccepted = useCallback(
    (data: any) => {
      console.log('🎉 friend_request_accepted:', data);
      onFriendAccepted({
        requestId: data.requestId,
        senderId: data.senderId,
        recipientId: data.recipientId,
        recipientName: data.recipientName,
        recipientAvatar: data.recipientAvatar || '',
      });

      toast.success('Friend Request Accepted', {
        description: `You are now friends with ${data.recipientName}`,
      });
    },
    [onFriendAccepted]
  );

  const handleFriendDeclined = useCallback(
    (data: any) => {
      console.log('❌ friend_request_declined:', data);
      onFriendDeclined({
        requestId: data.requestId,
        senderId: data.senderId,
        recipientId: data.recipientId,
        recipientName: data.recipientName,
      });

      toast.info('Friend Request Declined', {
        description: `${data.recipientName} declined your friend request`,
      });
    },
    [onFriendDeclined]
  );

  const handleMessage = useCallback(
    (msg: any) => {
      console.log('💬 receive_message:', msg);
      onMessage(msg);
    },
    [onMessage]
  );

  const handleMessagesRead = useCallback(
    ({ friendId }: { friendId: string }) => {
      console.log('👁️ messages read by friend:', friendId);
      onMessagesRead(friendId);
    },
    [onMessagesRead]
  );

  const handleTyping = useCallback(({ from }: { from: string }) => {
    console.log('✏️ typing from:', from);
  }, []);

  const handleStopTyping = useCallback(({ from }: { from: string }) => {
    console.log('🛑 stop typing from:', from);
  }, []);

  useEffect(() => {
    if (!socket) return;

    console.log('🔌 WebSocket listener active for ChatSideBar');

    socket.on('friend_request_received', handleFriendRequest);
    socket.on('friend_request_accepted', handleFriendAccepted);
    socket.on('friend_request_declined', handleFriendDeclined);
    socket.on('receive_message', handleMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('friend_request_received', handleFriendRequest);
      socket.off('friend_request_accepted', handleFriendAccepted);
      socket.off('friend_request_declined', handleFriendDeclined);
      socket.off('receive_message', handleMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [
    socket,
    handleFriendRequest,
    handleFriendAccepted,
    handleFriendDeclined,
    handleMessage,
    handleTyping,
    handleStopTyping,
    handleMessagesRead,
  ]);
};
