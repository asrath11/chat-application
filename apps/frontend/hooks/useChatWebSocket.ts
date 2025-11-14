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
    friendId: string;
    friendName: string;
    friendUsername: string;
    friendAvatar?: string;
  }) => void;
  onMessage: (msg: any) => void;
  onMessagesRead: (friendId: string) => void;
}

export const useChatWebSocket = ({
  socket,
  activeChatId,
  onReceivedRequest,
  onFriendAccepted,
  onMessage,
  onMessagesRead,
}: UseChatWebSocketProps) => {
  const handleFriendRequest = useCallback(
    (data: any) => {
      console.log('🔥 friend_request_received:', data);
      onReceivedRequest({
        id: data.requestId,
        name: data.fromName,
        username: data.fromUsername,
        avatar: data.fromAvatar || '',
        status: 'pending',
      });

      toast.info('New Friend Request', {
        description: `${data.fromName} (@${data.fromUsername}) sent you a friend request`,
      });
    },
    [onReceivedRequest]
  );

  const handleFriendAccepted = useCallback(
    (data: any) => {
      console.log('🎉 friend_request_accepted:', data);
      onFriendAccepted({
        requestId: data.requestId,
        friendId: data.friendId,
        friendName: data.friendName,
        friendUsername: data.friendUsername || '',
        friendAvatar: data.friendAvatar || '',
      });

      toast.success('Friend Request Accepted', {
        description: `You are now friends with ${data.friendName}`,
      });
    },
    [onFriendAccepted]
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
    socket.on('receive_message', handleMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('friend_request_received', handleFriendRequest);
      socket.off('friend_request_accepted', handleFriendAccepted);
      socket.off('receive_message', handleMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [
    socket,
    handleFriendRequest,
    handleFriendAccepted,
    handleMessage,
    handleTyping,
    handleStopTyping,
    handleMessagesRead,
  ]);
};
