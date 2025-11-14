import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { chatService } from '@/services/chat.service';
import { Friend, FriendRequest, CurrentUser, TabValue } from '@/types/chat.types';

export const useChatData = (activeTab: TabValue) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await chatService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error fetching current user:', err);
        toast.error('Failed to load user profile');
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch friends and all requests on mount for badge counts
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [friendsData, sentData, receivedData] = await Promise.all([
          chatService.getFriends(),
          chatService.getSentRequests(),
          chatService.getReceivedRequests(),
        ]);
        setFriends(friendsData);
        setSentRequests(sentData);
        setReceivedRequests(receivedData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load chats. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch requests based on active tab
  useEffect(() => {
    const fetchRequests = async () => {
      if (activeTab === 'messages') return;

      setIsLoading(true);
      setError(null);

      try {
        if (activeTab === 'sent-requests') {
          const data = await chatService.getSentRequests();
          setSentRequests(data);
        }

        if (activeTab === 'received-requests') {
          const data = await chatService.getReceivedRequests();
          setReceivedRequests(data);
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load requests. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [activeTab]);

  const addOrUpdateReceivedRequest = useCallback((req: FriendRequest) => {
    setReceivedRequests((prev) => {
      if (prev.some((r) => r.id === req.id)) return prev;
      return [req, ...prev];
    });
  }, []);

  const addFriendIfMissing = useCallback((chat: Friend) => {
    setFriends((prev) => {
      if (prev.some((f) => f.id === chat.id)) return prev;
      return [chat, ...prev];
    });
  }, []);

  const updateFriendMessage = useCallback((msg: any, activeChatId?: string) => {
    setFriends((prev) =>
      prev.map((chat) =>
        chat.id === msg.fromUserId
          ? {
              ...chat,
              lastMessage: msg.message,
              unread:
                activeChatId === msg.fromUserId ? chat.unread : chat.unread + 1,
              time: msg.createdAt ?? chat.time,
            }
          : chat
      )
    );
  }, []);

  const markMessagesAsRead = useCallback((friendId: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, unread: 0 } : f))  
    );
  }, []);

  const removeFriendRequest = useCallback((requestId: string) => {
    setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
    setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  return {
    friends,
    setFriends,
    sentRequests,
    setSentRequests,
    receivedRequests,
    currentUser,
    isLoading,
    error,
    setError,
    addOrUpdateReceivedRequest,
    addFriendIfMissing,
    updateFriendMessage,
    markMessagesAsRead,
    removeFriendRequest,
  };
};
