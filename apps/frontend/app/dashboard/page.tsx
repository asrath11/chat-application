'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/ui/components/resizable';
import { ChatPanel } from '@/features/dashboard/components/ChatPanel';
import { ChatSideBar } from '@/features/dashboard/components/ChatSideBar';

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();

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
          <div className='h-full p-4 border-r'>
            <ChatSideBar />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel>
          <div className='h-full p-4'>
            <ChatPanel />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
