import React, { useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Search, User, MessageSquare, UserPlus, Clock } from 'lucide-react';
import { SendRequestDialog } from './SendRequestDialog';
import { FriendRequests } from './FriendRequests';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Button } from '@workspace/ui/components/button';
import { Check, X } from 'lucide-react';
import { MessageList } from './MessageList';

type TabValue = 'messages' | 'received-requests' | 'sent-requests';

interface FriendRequest {
  id: string;
  name: string;
  avatar?: string;
  username: string;
}

interface Chat {
  id: string;
  name: string;
  lastMessage?: string;
  unread: number;
  avatar?: string;
  time: string;
}

function ChatSideBar() {
  const [activeTab, setActiveTab] = useState<TabValue>('messages');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual data from your API
  const receivedRequests: FriendRequest[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      username: 'alexj',
      avatar: '/avatars/01.png',
    },
    {
      id: '2',
      name: 'Sam Wilson',
      username: 'samwilson',
      avatar: '/avatars/02.png',
    },
  ];

  const sentRequests: FriendRequest[] = [
    {
      id: '3',
      name: 'Jordan Smith',
      username: 'jordans',
      avatar: '/avatars/03.png',
    },
    {
      id: '4',
      name: 'Taylor Swift',
      username: 'taylors',
      avatar: '/avatars/04.png',
    },
  ];

  const chats: Chat[] = [
    {
      id: '1',
      name: 'Tech Group',
      lastMessage: 'Check out this new framework!',
      unread: 3,
      time: '2h',
    },
    {
      id: '2',
      name: 'Sarah Miller',
      lastMessage: 'Meeting at 3pm',
      unread: 0,
      time: '1d',
      avatar: '/avatars/03.png',
    },
    {
      id: '3',
      name: 'Design Team',
      lastMessage: 'Here are the new mockups',
      unread: 5,
      time: '3d',
    },
  ];

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accept request:', requestId);
    // Implement accept friend request logic
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log('Decline request:', requestId);
    // Implement decline friend request logic
  };

  const handleSendRequest = (username: string) => {
    console.log('Sending friend request to:', username);
    // Here you would typically:
    // 1. Call your API to send a friend request
    // 2. Update the sentRequests state with the new request
    // 3. Show a success/error message

    // For now, we'll just log it
    const newRequest = {
      id: `temp-${Date.now()}`,
      name: username, // In a real app, you'd fetch the user's name from the API
      username,
    };

    // In a real app, you'd update the state with the response from the API
    // setSentRequests(prev => [...prev, newRequest]);
  };

  const handleNewChat = () => {
    console.log('Start new chat');
    // Implement new chat logic
  };

  const handleSelectChat = (chatId: string) => {
    console.log('Selected chat:', chatId);
    // Implement chat selection logic
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Search Bar */}
      <div className='p-4 border-b'>
        <div className='relative'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search messages or users...'
            className='w-full pl-8'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue='messages'
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
        className='flex-1 flex flex-col'
      >
        <TabsList className='w-full rounded-none border-b bg-transparent p-0'>
          <TabsTrigger
            value='messages'
            className='flex-1 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none'
          >
            <MessageSquare className='h-4 w-4 mr-2' />
            Messages
          </TabsTrigger>
          <TabsTrigger
            value='received-requests'
            className='flex-1 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none'
          >
            <User className='h-4 w-4 mr-2' />
            Received
            {receivedRequests.length > 0 && (
              <span className='ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                {receivedRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value='sent-requests'
            className='flex-1 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none'
          >
            <User className='h-4 w-4 mr-2' />
            Sent
            {sentRequests.length > 0 && (
              <span className='ml-2 bg-muted text-muted-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                {sentRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className='flex-1 overflow-hidden'>
          <TabsContent value='messages' className='m-0 h-full'>
            <MessageList
              chats={chats}
              onNewChat={handleNewChat}
              onSelectChat={handleSelectChat}
            />
          </TabsContent>

          <TabsContent value='received-requests' className='m-0 h-full'>
            <>
              {receivedRequests.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  No friend requests
                </div>
              ) : (
                <div className='space-y-4'>
                  <FriendRequests
                    friendRequests={receivedRequests}
                    onAccept={handleAcceptRequest}
                    onDecline={handleDeclineRequest}
                  />
                </div>
              )}
            </>
          </TabsContent>
          <TabsContent value='sent-requests' className='m-0 h-full'>
            <div className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold'>Sent Requests</h2>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-muted-foreground'>
                    {sentRequests.length} sent
                  </span>
                  <SendRequestDialog onSendRequest={handleSendRequest} />
                </div>
              </div>
              <div className='space-y-4'>
                {sentRequests.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    No sent requests
                  </div>
                ) : (
                  sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className='flex items-center justify-between p-3 rounded-lg border'
                    >
                      <div className='flex items-center space-x-3'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage src={request.avatar} alt={request.name} />
                          <AvatarFallback>
                            {request.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium'>{request.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            @{request.username}
                          </p>
                        </div>
                      </div>
                      <div className='text-sm text-muted-foreground flex items-center'>
                        <Clock className='h-4 w-4 mr-1' />
                        Pending
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export { ChatSideBar };
