import { useFriendStore } from '@/stores/friendStore';
import { useFriendRequestStore } from '@/stores/friendRequestStore';

/**
 * Hook to access friend and request data from stores
 * Data is managed by WebSocket and initial fetch
 */
export const useFriend = () => {
  const { friends } = useFriendStore();
  const { sentRequests, receivedRequests } = useFriendRequestStore();

  return {
    friends,
    sentRequests,
    receivedRequests,
  };
};
