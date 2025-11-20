import React, { useState, useMemo, useCallback } from 'react';
import { MessageSquare, User, UserPlus } from 'lucide-react';
import { Tabs } from '../shared';
import { ChatSideBarHeader, ChatSideBarSearch } from './';
import { MessagesTab, ReceivedRequestsTab, SentRequestsTab } from './tabs';
import { useAuthStore } from '@/stores/authStore';
import { TabValue } from '@/types/chat.types';
import { useFriend } from '@/hooks/useFriend';
import { useAuth } from '@/contexts/AuthContext';

function ChatSideBar() {
  const [activeTab, setActiveTab] = useState<TabValue>('messages');
  const [searchQuery, setSearchQuery] = useState('');

  const { friends, receivedRequests } = useFriend();
  const { currentUser } = useAuthStore();
  const { logout } = useAuth();

  const totalUnreadCount = useMemo(
    () => friends.reduce((acc, f) => acc + f.unread, 0),
    [friends]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  }, [logout]);

  const chatTabs = useMemo(
    () => [
      {
        id: 'messages',
        label: 'Messages',
        icon: <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />,
        badge: totalUnreadCount || undefined,
        Component: MessagesTab,
      },
      {
        id: 'received-requests',
        label: 'Received',
        icon: <User className="h-5 w-5 sm:h-6 sm:w-6" />,
        badge: receivedRequests.length || undefined,
        Component: ReceivedRequestsTab,
      },
      {
        id: 'sent-requests',
        label: 'Sent',
        icon: <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />,
        Component: SentRequestsTab,
      },
    ],
    [totalUnreadCount, receivedRequests.length]
  );

  const ActiveTab = chatTabs.find((t) => t.id === activeTab)?.Component;

  return (
    <div className="flex flex-row h-full w-full">
      <nav className="w-14 sm:w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-3 gap-3">
        <Tabs tabs={chatTabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as TabValue)} />
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        <ChatSideBarHeader currentUser={currentUser} onSignOut={handleLogout} />
        <ChatSideBarSearch value={searchQuery} onChange={setSearchQuery} />

        <main className="flex-1 overflow-hidden min-h-0">{ActiveTab && <ActiveTab />}</main>
      </div>
    </div>
  );
}

export { ChatSideBar };
