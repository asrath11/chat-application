import React, { useState, useCallback, useMemo } from 'react';
import { MessageSquare, User, UserPlus } from 'lucide-react';
import { SentRequestsList, FriendRequests, SendRequestDialog } from '../friend-requests';
import { MessageList } from '../message-list';
import { Tabs, LoadingSpinner, ErrorDisplay, EmptyState } from '../shared';
import { ChatSideBarHeader, ChatSideBarSearch } from './';
import { useAuthStore } from '@/stores/authStore';
import { useFriendStore } from '@/stores/friendStore';
import { TabValue } from '@/types/chat.types';
import { useFriend } from '@/hooks/useFriend';
import { useFriendRequestActions } from '@/hooks/useFriendRequestActions';
import { useAuth } from '@/contexts/AuthContext';

function ChatSideBar() {
  const [activeTab, setActiveTab] = useState<TabValue>('messages');
  const [searchQuery, setSearchQuery] = useState('');

  const { friends, sentRequests, receivedRequests } = useFriend();
  const { selectFriend } = useFriendStore();
  const { currentUser, isLoading, error } = useAuthStore();
  const { logout } = useAuth();
  const {
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    loadingRespondRequestId
  } = useFriendRequestActions();

  const totalUnreadCount = useMemo(
    () => friends.reduce((acc, friend) => acc + friend.unread, 0),
    [friends]
  );

  const chatTabs = useMemo(
    () => [
      {
        id: 'messages',
        label: 'Messages',
        icon: <MessageSquare className='h-5 w-5 sm:h-6 sm:w-6' strokeWidth={2} />,
        badge: totalUnreadCount > 0 ? totalUnreadCount : undefined,
      },
      {
        id: 'received-requests',
        label: 'Received Requests',
        icon: <User className='h-5 w-5 sm:h-6 sm:w-6' strokeWidth={2} />,
        badge: receivedRequests.length > 0 ? receivedRequests.length : undefined,
      },
      {
        id: 'sent-requests',
        label: 'Sent Requests',
        icon: <UserPlus className='h-5 w-5 sm:h-6 sm:w-6' strokeWidth={2} />,
        badge: sentRequests.length > 0 ? sentRequests.length : undefined,
      },
    ],
    [totalUnreadCount, receivedRequests.length, sentRequests.length]
  );

  const handleChatSelect = useCallback(
    (friendId: string) => {
      const friend = friends.find((f) => f.id === friendId);
      if (friend) {
        selectFriend(friend);
      }
    },
    [friends, selectFriend]
  );


  const handleSignOut = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [logout]);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id as TabValue);
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
                  friends={friends}
                  onSelectChat={handleChatSelect}
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
                <FriendRequests
                  friendRequests={receivedRequests}
                  onAccept={acceptFriendRequest}
                  onDecline={declineFriendRequest}
                  loadingRequestId={loadingRespondRequestId}
                />
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
                  <SendRequestDialog onSendRequest={sendFriendRequest} />
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
