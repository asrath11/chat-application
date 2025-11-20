import React, { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { NewChatDialog } from '../chat-window/NewChatDialog';
import { useFriendStore } from '@/stores/friendStore';

interface Chat {
  id: string;
  name: string;
  lastMessage?: string;
  unread: number;
  avatar?: string;
  time: string;
}

interface MessageListProps {
  friends: Chat[];
  onSelectChat: (id: string) => void;
  activeChatId?: string;
}

export function MessageList({
  friends,
  onSelectChat,
  activeChatId,
}: MessageListProps) {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const typingByFriend = useFriendStore((state) => state.typingByFriend);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Today - show time
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    // Yesterday
    if (diffDays === 1) {
      return 'Yesterday';
    }

    // Within last week - show day name
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // Older - show date
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    });
  };

  const handleStartChat = (userId: string) => {
    console.log('Starting chat with user:', userId);
    // Here you would typically:
    // 1. Create a new chat in your backend
    // 2. Add the chat to your local state
    // 3. Navigate to the new chat
  };
  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='p-4 border-b'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Messages</h2>
          <NewChatDialog
            open={isNewChatOpen}
            onOpenChange={setIsNewChatOpen}
            onStartChat={handleStartChat}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className='flex-1 overflow-y-auto'>
        {friends.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-center p-8'>
            <p className='text-muted-foreground'>No messages yet</p>
          </div>
        ) : (
          <div className='divide-y'>
            {friends.map((friend) => (
              <button
                key={friend.id}
                className='w-full flex items-center p-3 hover:bg-accent transition-colors text-left'
                onClick={() => onSelectChat(friend.id)}
              >
                <div className='relative mr-3'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {friend.unread > 0 && friend.id !== activeChatId && (
                    <span className='absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                      {friend.unread}
                    </span>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between items-center'>
                    <p className='font-medium truncate'>{friend.name}</p>
                    <span className='text-xs text-muted-foreground'>
                      {formatTime(friend.time)}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground truncate text-left'>
                    {typingByFriend[friend.id]
                      ? 'typing…'
                      : friend.lastMessage || 'Start the conversation'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
