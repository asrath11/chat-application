import { Clock, Check, X } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { FriendRequest } from '../../../types/chat.types';

interface SentRequestsListProps {
  requests: FriendRequest[];
}

export const SentRequestsList = ({ requests }: SentRequestsListProps) => {
  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return (
          <Check className='h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-green-500' />
        );
      case 'declined':
        return <X className='h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-red-500' />;
      case 'pending':
      default:
        return (
          <Clock className='h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-amber-400' />
        );
    }
  };

  return (
    <div className='space-y-2 sm:space-y-3'>
      {requests.map((request) => (
        <div
          key={request.id}
          className='flex items-center justify-between p-2.5 sm:p-3 rounded-lg border hover:bg-accent/50 transition-colors gap-2'
        >
          <div className='flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1'>
            <Avatar className='h-10 w-10 sm:h-12 sm:w-12 shrink-0'>
              <AvatarImage src={request.avatar} alt={request.name} />
              <AvatarFallback className='bg-zinc-700 text-white font-medium'>
                {request.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='font-medium text-xs sm:text-sm truncate'>
                {request.name}
              </p>
              <p className='text-[10px] sm:text-xs text-muted-foreground truncate'>
                @{request.username}
              </p>
            </div>
          </div>
          <div className='text-[10px] sm:text-xs text-muted-foreground flex items-center shrink-0'>
            {getStatusIcon(request.status)}
            <span className='hidden sm:inline capitalize'>{request.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
