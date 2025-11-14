import React, { useState, useCallback, useMemo } from 'react';
import { MessageSquare, User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/contexts/WebSocketContext';
import {
  SendRequestDialog,
  FriendRequests,
  SentRequestsList,
} from '../friend-requests';
import { MessageList } from '../message-list';
import { Tabs, LoadingSpinner, ErrorDisplay, EmptyState } from '../shared';
import { ChatSideBarHeader, ChatSideBarSearch } from './';
import { useChatData } from '@/hooks/useChatData';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { chatService } from '@/services/chat.service';
import { ChatSideBarProps, TabValue, Friend } from '@/types/chat.types';

function ChatSideBar({ onSelectChat, activeChatId }: ChatSideBarProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

  const { socket } = useWebSocket();
  const router = useRouter();

  const {
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
  } = useChatData(activeTab);

  // WebSocket integration
  useChatWebSocket({
    socket,
    activeChatId,
    onReceivedRequest: addOrUpdateReceivedRequest,
    onFriendAccepted: (data) => {
      addFriendIfMissing({
        id: data.friendId,
        name: data.friendName,
        username: data.friendUsername,
        avatar: data.friendAvatar || '',
        lastMessage: '',
        unread: 0,
        time: new Date().toISOString(),
      });
      removeFriendRequest(data.requestId);
    },
    onFriendDeclined: (data) => {
      // Update the sent request status to 'declined'
      setSentRequests((prev) =>
        prev.map((req) =>
          req.id === data.requestId ? { ...req, status: 'declined' } : req
        )
      );
    },
    onMessage: (msg) => updateFriendMessage(msg, activeChatId),
    onMessagesRead: markMessagesAsRead,
  });

  // Computed values
  const totalUnreadCount = useMemo(
    () => friends.reduce((sum, friend) => sum + friend.unread, 0),
    [friends]
  );

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const query = searchQuery.toLowerCase();
    return friends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(query) ||
        friend.username?.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  const chatTabs = useMemo(
    () => [
      {
        id: 'messages',
        label: 'Messages',
        icon: <MessageSquare className='h-5 w-5 sm:h-6 sm:w-6' strokeWidth={2} />,
        badge: totalUnreadCount,
      },
      {
        id: 'received-requests',
        label: 'Received Requests',
        icon: <User className='h-5 w-5 sm:h-6 sm:w-6' strokeWidth={2} />,
        badge: receivedRequests.length,
      },
      {
        id: 'sent-requests',
        label: 'Sent Requests',
        icon: <UserPlus className='h-5 w-5 sm:h-6 sm:w-6' strokeWidth={2} />,
        badge: sentRequests.length,
      },
    ],
    [totalUnreadCount, receivedRequests.length, sentRequests.length]
  );

  // Event handlers
  const handleAcceptRequest = useCallback(
    async (requestId: string) => {
      try {
        setLoadingRequestId(requestId);
        const data = await chatService.respondToRequest(requestId, 'accept');

        removeFriendRequest(requestId);

        if (socket && data.data) {
          socket.emit('friend_request_accepted', {
            requestId: requestId,
            userId: data.data.friendId,
            friendId: data.data.myId,
            friendName: data.data.myName,
            friendAvatar: data.data.myAvatar,
          });
        }

        toast.success('Friend request accepted');
      } catch (error) {
        console.error('Error accepting request:', error);
        toast.error('Failed to accept request');
      } finally {
        setLoadingRequestId(null);
      }
    },
    [socket, removeFriendRequest]
  );

  const handleDeclineRequest = useCallback(
    async (requestId: string) => {
      try {
        setLoadingRequestId(requestId);
        const data = await chatService.respondToRequest(requestId, 'reject');
        removeFriendRequest(requestId);

        // Emit WebSocket event to notify the sender
        if (socket && data.data) {
          socket.emit('friend_request_declined', {
            requestId: requestId,
            userId: data.data.senderId,
            recipientName: data.data.recipientName,
          });
        }

        toast.success('Friend request declined');
      } catch (error) {
        console.error('Error declining request:', error);
        toast.error('Failed to decline request');
      } finally {
        setLoadingRequestId(null);
      }
    },
    [removeFriendRequest, socket]
  );

  const handleSendRequest = useCallback(
    async (username: string) => {
      try {
        const data = await chatService.sendFriendRequest(username);
        // console.log(username)
        if (data.success && data.data) {
          setSentRequests((prev) => [
            ...prev,
            {
              id: data.data.id,
              name: data.data.name,
              username: data.data.username,
              status: 'pending',
            },
          ]);

          if (socket && data.data.recipientId) {
            socket.emit('friend_request_sent', {
              requestId: data.data.id,
              toUserId: data.data.recipientId,
              fromName: data.data.fromName,
              fromUsername: data.data.fromUsername,
              fromAvatar: data.data.fromAvatar,
            });
          }

          toast.success('Friend request sent', {
            description: `Request sent to ${data.data.name}`,
          });
        }
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || 'Failed to send request';
        setError(errorMsg);
        toast.error('Error', { description: errorMsg });
      }
    },
    [socket, setSentRequests, setError]
  );

  const handleSelectChat = useCallback(
    (chatId: string) => {
      const selectedFriend = friends.find((f) => f.id === chatId);
      if (selectedFriend) {
        setFriends((prev) =>
          prev.map((f) => (f.id === chatId ? { ...f, unread: 0 } : f))
        );
        onSelectChat(selectedFriend);
      }
    },
    [friends, onSelectChat, setFriends]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await chatService.logout();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }, [router]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId as TabValue);
      setError(null);
    },
    [setError]
  );

  const handleNewChat = useCallback(() => {
    console.log('Start new chat');
  }, []);

  // Render
  return (
    <div className='flex flex-row h-full w-full'>
      <nav
        className='w-14 sm:w-16 bg-zinc-900 dark:bg-zinc-950 flex flex-col items-center py-3 gap-3 shrink-0 border-r border-zinc-800'
        aria-label='Main navigation'
      >
        <Tabs
          tabs={chatTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </nav>

      <div className='flex-1 flex flex-col min-w-0'>
        <ChatSideBarHeader currentUser={currentUser} onSignOut={handleSignOut} />
        <ChatSideBarSearch value={searchQuery} onChange={setSearchQuery} />

        <main className='flex-1 overflow-hidden min-h-0'>
          {activeTab === 'messages' && (
            <div className='h-full flex flex-col'>
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorDisplay message={error} />
              ) : (
                <MessageList
                  friends={filteredFriends}
                  onNewChat={handleNewChat}
                  onSelectChat={handleSelectChat}
                  activeChatId={activeChatId}
                />
              )}
            </div>
          )}

          {activeTab === 'received-requests' && (
            <div className='h-full overflow-auto'>
              <div className='p-3 sm:p-4 border-b bg-accent/30'>
                <h2 className='text-base sm:text-lg font-semibold'>
                  Received Requests
                </h2>
                <p className='text-[10px] sm:text-xs text-muted-foreground mt-0.5'>
                  {receivedRequests.length} pending{' '}
                  {receivedRequests.length === 1 ? 'request' : 'requests'}
                </p>
              </div>
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorDisplay message={error} />
              ) : receivedRequests.length === 0 ? (
                <EmptyState message='No pending friend requests' />
              ) : (
                <div className='p-2 sm:p-4'>
                  <FriendRequests
                    friendRequests={receivedRequests}
                    onAccept={handleAcceptRequest}
                    onDecline={handleDeclineRequest}
                    loadingRequestId={loadingRequestId}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'sent-requests' && (
            <div className='h-full overflow-auto'>
              <div className='p-3 sm:p-4 border-b bg-accent/30'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
                  <div>
                    <h2 className='text-base sm:text-lg font-semibold'>
                      Sent Requests
                    </h2>
                    <p className='text-[10px] sm:text-xs text-muted-foreground mt-0.5'>
                      {sentRequests.length}{' '}
                      {sentRequests.length === 1 ? 'request' : 'requests'} sent
                    </p>
                  </div>
                  <SendRequestDialog onSendRequest={handleSendRequest} />
                </div>
              </div>

              <div className='p-3 sm:p-4'>
                {isLoading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorDisplay message={error} />
                ) : sentRequests.length === 0 ? (
                  <EmptyState message="You haven't sent any friend requests yet" />
                ) : (
                  <SentRequestsList requests={sentRequests} />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export { ChatSideBar };
