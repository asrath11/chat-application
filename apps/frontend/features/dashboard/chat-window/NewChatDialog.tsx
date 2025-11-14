import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Search, UserPlus } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: (userId: string) => void;
}

export function NewChatDialog({
  open,
  onOpenChange,
  onStartChat,
}: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock users - replace with actual API call
  const users: User[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      status: 'online',
    },
    { id: '2', name: 'Sam Wilson', email: 'sam@example.com', status: 'offline' },
    {
      id: '3',
      name: 'Jordan Smith',
      email: 'jordan@example.com',
      status: 'away',
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8'>
          <UserPlus className='h-4 w-4 mr-1' />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription>
            Start a new conversation by selecting a contact.
          </DialogDescription>
          <DialogClose />
        </DialogHeader>

        <div className='space-y-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search contacts...'
              className='pl-9'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='max-h-[300px] overflow-y-auto space-y-2'>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className='flex items-center p-2 rounded-md hover:bg-accent cursor-pointer'
                  onClick={() => {
                    onStartChat(user.id);
                    onOpenChange(false);
                  }}
                >
                  <div className='relative mr-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                        user.status === 'online'
                          ? 'bg-green-500'
                          : user.status === 'away'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>{user.name}</p>
                    <p className='text-xs text-muted-foreground truncate'>
                      {user.email}
                    </p>
                  </div>
                  <Button variant='ghost' size='sm'>
                    Message
                  </Button>
                </div>
              ))
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No contacts found
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
