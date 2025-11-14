import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ChatWindow } from '../chat-window/ChatWindow';

function ChatPanel() {
  const { selectedFriend } = useChat();
  if (!selectedFriend) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <p className='text-lg font-semibold text-muted-foreground'>
            Select a conversation
          </p>
          <p className='text-sm text-muted-foreground mt-2'>
            Choose a friend from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatWindow
      friendId={selectedFriend.id}
      friendName={selectedFriend.name}
      friendAvatar={selectedFriend.avatar}
      friendUsername={selectedFriend.username}
    />
  );
}

export { ChatPanel };
