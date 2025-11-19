import React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Check, X, Loader2 } from 'lucide-react';

interface FriendRequest {
  id: string;
  name: string;
  avatar?: string;
  username: string;
}

interface FriendRequestsProps {
  friendRequests: FriendRequest[];
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  loadingRequestId: string | null;
}

export function FriendRequests({
  friendRequests,
  onAccept,
  onDecline,
  loadingRequestId,
}: FriendRequestsProps) {
  if (friendRequests.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center p-8'>
        <p className='text-muted-foreground'>No friend requests</p>
      </div>
    );
  }

  return (
    <div className='p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold'>Friend Requests</h2>
        <span className='text-sm text-muted-foreground'>
          {friendRequests.length} pending
        </span>
      </div>

      <div className='space-y-4'>
        {friendRequests.map((request) => {
          const isLoading = loadingRequestId === request.id;

          return (
            <div
              key={request.id}
              className='flex items-center justify-between p-3 rounded-lg border'
            >
              <div className='flex items-center space-x-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src={request.avatar} alt={request.name} />
                  <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>{request.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    @{request.username}
                  </p>
                </div>
              </div>
              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => onDecline(request.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <X className='h-4 w-4' />
                  )}
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => onAccept(request.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Check className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
