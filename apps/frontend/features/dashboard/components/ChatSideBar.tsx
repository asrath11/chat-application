import React, { useEffect, useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Search, User, MessageSquare, Clock } from 'lucide-react';
import { SendRequestDialog } from './SendRequestDialog';
import { FriendRequests } from './FriendRequests';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { MessageList } from './MessageList';
import { api } from '@/lib/axio';
import { useWebSocket } from '@/contexts/WebSocketContext';

type TabValue = 'messages' | 'received-requests' | 'sent-requests';

interface FriendRequest {
  id: string;
  name: string;
  avatar?: string;
  username: string;
  status?: 'pending' | 'accepted' | 'declined';
}

interface Friend {
  id: string;
  name: string;
  lastMessage?: string;
  unread: number;
  avatar?: string;
  time: string;
  username?: string;
}

interface ChatSideBarProps {
  onSelectChat: React.Dispatch<React.SetStateAction<Friend | null>>;
}

function ChatSideBar({ onSelectChat }: ChatSideBarProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { socket } = useWebSocket();

  // -------- Helpers --------
  const addOrUpdateReceivedRequest = (req: FriendRequest) =>
    setReceivedRequests((prev) => {
      if (prev.some((r) => r.id === req.id)) return prev;
      return [req, ...prev];
    });

  const addFriendIfMissing = (chat: Friend) =>
    setFriends((prev) => {
      if (prev.some((f) => f.id === chat.id)) return prev;
      return [chat, ...prev];
    });

  // -------- Fetch Sent/Received Requests --------
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

  // -------- Fetch Friends --------
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

  // -------- WebSocket Integration --------
  useEffect(() => {
    if (!socket) return;

    console.log('🔌 WebSocket listener active for ChatSideBar');

    // 🔥 Received New Friend Request
    const onFriendRequest = (data: any) => {
      console.log('🔥 friend_request_received:', data);
      addOrUpdateReceivedRequest({
        id: data.requestId,
        name: data.fromName,
        username: data.fromUsername,
        avatar: data.fromAvatar || '',
        status: 'pending',
      });
    };

    // 🤝 Friend Request Accepted
    const onFriendAccepted = (data: any) => {
      console.log('🎉 friend_request_accepted:', data);

      addFriendIfMissing({
        id: data.friendId,
        name: data.friendName,
        avatar: data.friendAvatar || '',
        lastMessage: '',
        unread: 0,
        time: new Date().toISOString(),
      });

      // Remove from pending lists
      setReceivedRequests((prev) => prev.filter((r) => r.id !== data.requestId));
      setSentRequests((prev) => prev.filter((r) => r.id !== data.requestId));
    };

    // 💬 New Message
    const onMessage = (msg: any) => {
      console.log('💬 receive_message:', msg);

      setFriends((prev) =>
        prev.map((chat) =>
          chat.id === msg.fromUserId
            ? {
              ...chat,
              lastMessage: msg.message,
              unread: chat.unread + 1,
              time: msg.createdAt ?? chat.time,
            }
            : chat
        )
      );
    };

    // ✏️ Typing
    const onTyping = ({ from }: { from: string }) => {
      console.log('✏️ typing from:', from);
    };

    // 🛑 Stop typing
    const onStopTyping = ({ from }: { from: string }) => {
      console.log('🛑 stop typing from:', from);
    };

    // Attach Listeners
    socket.on('friend_request_received', onFriendRequest);
    socket.on('friend_request_accepted', onFriendAccepted);
    socket.on('receive_message', onMessage);
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStopTyping);

    // Cleanup Listeners
    return () => {
      socket.off('friend_request_received', onFriendRequest);
      socket.off('friend_request_accepted', onFriendAccepted);
      socket.off('receive_message', onMessage);
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStopTyping);
    };
  }, [socket]);

  // -------- Handlers --------
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
    try {
      setIsLoading(true);
      const { data } = await api.post('/friend-request', { username });

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
      }
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    console.log('Start new chat');
  };

  const handleSelectChat = (chatId: string) => {
    const selectedFriend = friends.find((f) => f.id === chatId);
    console.log(selectedFriend);
    if (selectedFriend) {
      onSelectChat(selectedFriend);
    }
  };

  // -------- UI Rendering --------
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
          <TabsTrigger value='messages' className='flex-1 py-4'>
            <MessageSquare className='h-4 w-4 mr-2' />
            Messages
          </TabsTrigger>

          <TabsTrigger value='received-requests' className='flex-1 py-4'>
            <User className='h-4 w-4 mr-2' />
            Received
            {receivedRequests.length > 0 && (
              <span className='ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                {receivedRequests.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value='sent-requests' className='flex-1 py-4'>
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
                onSelectChat={(id: string) => handleSelectChat(id)}
              />
            )}
          </TabsContent>

          <TabsContent value='received-requests' className='m-0 h-full'>
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
