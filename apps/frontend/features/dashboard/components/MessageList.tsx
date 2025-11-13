import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { NewChatDialog } from './NewChatDialog';

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
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export function MessageList({ friends, onSelectChat }: MessageListProps) {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

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
            <NewChatDialog
              open={isNewChatOpen}
              onOpenChange={setIsNewChatOpen}
              onStartChat={handleStartChat}
            >
              <Button variant='ghost' className='mt-2'>
                Start a new conversation
              </Button>
            </NewChatDialog>
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
                  {friend.unread > 0 && (
                    <span className='absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                      {friend.unread}
                    </span>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between items-center'>
                    <p className='font-medium truncate'>{friend.name}</p>
                    <span className='text-xs text-muted-foreground'>
                      {friend.time}
                    </span>
                  </div>
                  {friend.lastMessage && (
                    <p className='text-sm text-muted-foreground truncate text-left'>
                      {friend.lastMessage}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
