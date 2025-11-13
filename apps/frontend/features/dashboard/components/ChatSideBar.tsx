import React, { useEffect, useState } from 'react';
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
import { MessageList } from './MessageList';
import { api } from '@/lib/axio';

type TabValue = 'messages' | 'received-requests' | 'sent-requests';

interface FriendRequest {
  id: string;
  name: string;
  avatar?: string;
  username: string;
  status?: 'pending' | 'accepted' | 'declined';
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
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (activeTab === 'sent-requests') {
          const { data } = await api.get('/friend-request/sent');
          setSentRequests(data.data);
        }

        if (activeTab === 'received-requests') {
          const { data } = await api.get('/friend-request/incoming');
          setReceivedRequests(data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await api.get('/friends');
        setFriends(data.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load chats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.post('/friend-request/respond', { requestId, action: 'accept' });
      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await api.post('/friend-request/respond', { requestId, action: 'reject' });
      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleSendRequest = async (username: string) => {
    console.log('Sending friend request to:', username);
    try {
      // Make the API call
      setIsLoading(true);
      const { data } = await api.post('/friend-request', { username });

      // Replace the optimistic update with the actual server response
      if (data.success && data.data) {
        setSentRequests((prev) => [
          ...prev,
          {
            id: data.data.id,
            name: data.data.name,
            username: data.data.username,
          },
        ]);
      }
    } catch (error: any) {
      const data = error.response.data.message;
      console.error('Error sending request:', data);
      setError(data);
    } finally {
      setIsLoading(false);
    }
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
            {isLoading ? (
              <div className='flex justify-center py-8'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              </div>
            ) : error ? (
              <div className='text-center py-8 text-destructive'>{error}</div>
            ) : (
              <MessageList
                friends={friends}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
              />
            )}
          </TabsContent>

          <TabsContent value='received-requests' className='m-0 h-full'>
            <>
              {isLoading ? (
                <div className='flex justify-center py-8'>
                  <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                </div>
              ) : error ? (
                <div className='text-center py-8 text-destructive'>{error}</div>
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
                  {!isLoading && (
                    <span className='text-sm text-muted-foreground'>
                      {sentRequests.length}{' '}
                      {sentRequests.length === 1 ? 'request' : 'requests'} sent
                    </span>
                  )}
                  <SendRequestDialog onSendRequest={handleSendRequest} />
                </div>
              </div>
              <div className='space-y-4'>
                {isLoading ? (
                  <div className='flex justify-center py-8'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                  </div>
                ) : error ? (
                  <div className='text-center py-8 text-destructive'>{error}</div>
                ) : sentRequests.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    You haven't sent any friend requests yet.
                  </div>
                ) : (
                  sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className='flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors'
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
                        {request.status}
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
