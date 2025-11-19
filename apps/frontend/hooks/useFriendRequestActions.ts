import { useState } from 'react';
import { toast } from 'sonner';
import { friendService } from '@/services/friend.service';
import { useFriendRequestStore } from '@/stores/friendRequestStore';
import { useFriendStore } from '@/stores/friendStore';
import { websocketService } from '@/services/websocket.service';

/**
 * Hook for friend request actions (send, accept, decline)
 */
export const useFriendRequestActions = () => {
  const [loadingRespondRequestId, setLoadingRespondRequestId] = useState<string | null>(null);
  const [loadingSendRequest, setLoadingSendRequest] = useState(false);

  const { removeReceivedRequest } = useFriendRequestStore();
  const { addFriend } = useFriendStore();

  const sendFriendRequest = async (username: string) => {
    setLoadingSendRequest(true);
    try {
      const response = await friendService.sendFriendRequest(username);
      
      // Emit WebSocket event to notify the recipient
      if (response.data) {
        websocketService.emitFriendRequestSent({
          requestId: response.data.id,
          recipientId: response.data.recipientId,
          senderName: response.data.senderName,
          senderUsername: response.data.senderUsername,
          senderAvatar: response.data.senderAvatar,
        });
      }

      toast.success('Friend request sent', {
        description: `Request sent to @${username}`,
      });
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send request', {
        description: error.response?.data?.message || 'Please try again',
      });
      throw error;
    } finally {
      setLoadingSendRequest(false);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    setLoadingRespondRequestId(requestId);
    try {
      const response = await friendService.respondToRequest(requestId, 'accept');

      // Remove from received requests
      removeReceivedRequest(requestId);

      // Add to friends list
      if (response.data?.friend) {
        addFriend(response.data.friend);
      }

      // Emit WebSocket event to notify the sender
      if (response.data) {
        websocketService.emitFriendRequestAccepted({
          requestId,
          senderId: response.data.senderId,
          recipientId: response.data.recipientId,
          recipientName: response.data.recipientName,
          recipientAvatar: response.data.recipientAvatar,
        });
      }

      toast.success('Friend request accepted');
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept request', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoadingRespondRequestId(null);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    setLoadingRespondRequestId(requestId);
    try {
      const response = await friendService.respondToRequest(requestId, 'reject');

      // Remove from received requests
      removeReceivedRequest(requestId);

      // Emit WebSocket event to notify the sender
      if (response.data) {
        websocketService.emitFriendRequestDeclined({
          requestId,
          senderId: response.data.senderId,
          recipientId: response.data.recipientId,
          recipientName: response.data.recipientName,
        });
      }

      toast.info('Friend request declined');
    } catch (error: any) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline request', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoadingRespondRequestId(null);
    }
  };

  return {
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    loadingRespondRequestId,
    loadingSendRequest,
  };
};
