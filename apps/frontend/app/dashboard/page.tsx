'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/ui/components/resizable';
import { ChatPanel } from '@/features/dashboard/chat-window/ChatPanel';
import { ChatSideBar } from '@/features/dashboard/chat-sidebar/ChatSideBar';

interface Friend {
  id: string;
  name: string;
  lastMessage?: string;
  unread: number;
  avatar?: string;
  time: string;
  username?: string;
}

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='animate-spin size-6' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex h-screen items-center justify-center text-xl'>
        Unauthorized
      </div>
    );
  }

  return (
    <div className='h-screen'>
      {/* ⭐ KEY FIX */}
      <ResizablePanelGroup
        direction='horizontal'
        className='h-full w-full border rounded-lg'
      >
        <ResizablePanel minSize={15} maxSize={25} defaultSize={20}>
          <div className='h-full border-r'>
            <ChatSideBar
              onSelectChat={setSelectedFriend}
              activeChatId={selectedFriend?.id}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel>
          <div className='h-full p-4'>
            <ChatPanel selectedFriend={selectedFriend} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
