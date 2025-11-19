import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useFriendStore } from '@/stores/friendStore';
import { useFriendRequestStore } from '@/stores/friendRequestStore';
import { authService } from '@/services/auth.service';
import { friendService } from '@/services/friend.service';

/**
 * Hook to initialize chat data on mount
 * Fetches friends, requests, and current user
 */
export const useInitializeChatData = () => {
  const { setCurrentUser, setLoading, setError } = useAuthStore();
  const { setFriends } = useFriendStore();
  const { setSentRequests, setReceivedRequests } = useFriendRequestStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [friendsData, sentData, receivedData, userData] = await Promise.all([
          friendService.getFriends(),
          friendService.getSentRequests(),
          friendService.getReceivedRequests(),
          authService.getCurrentUser(),
        ]);

        setFriends(friendsData);
        setSentRequests(sentData);
        setReceivedRequests(receivedData);
        setCurrentUser(userData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        const errorMsg = 'Failed to load chat data. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [setFriends, setSentRequests, setReceivedRequests, setCurrentUser, setLoading, setError]);
};
