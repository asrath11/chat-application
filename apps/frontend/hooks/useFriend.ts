import { useFriendStore } from '@/stores/friendStore';
import { useFriendRequestStore } from '@/stores/friendRequestStore';

/**
 * Hook to access friend and request data from stores
 * Data is managed by WebSocket and initial fetch
 */
export const useFriend = () => {
  // Explicitly subscribe to friends array to ensure re-renders
  const friends = useFriendStore((state) => state.friends);
  const sentRequests = useFriendRequestStore((state) => state.sentRequests);
  const receivedRequests = useFriendRequestStore((state) => state.receivedRequests);

  return {
    friends,
    sentRequests,
    receivedRequests,
  };
};
