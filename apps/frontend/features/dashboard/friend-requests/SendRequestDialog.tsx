import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { UserPlus, Search, Loader2, Check, Clock, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { friendService } from '@/services/friend.service';
import { SearchedUser } from '@/types/chat.types';
import { useDebounce } from '@/hooks/useDebounce';

interface SendRequestDialogProps {
  onSendRequest: (username: string) => void;
}

export function SendRequestDialog({ onSendRequest }: SendRequestDialogProps) {
  const [username, setUsername] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedUsername = useDebounce(username, 300);

  // Search users as user types
  useEffect(() => {
    if (debouncedUsername.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const results = await friendService.searchUsers(debouncedUsername);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedUsername]);

  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [isOpen]);

  const handleSelectUser = async (user: SearchedUser) => {
    if (user.status === 'none') {
      setIsLoading(true);
      console.log(user);
      try {
        await onSendRequest(user.username);
        setShowDropdown(false);
        setSearchResults([]);
        setUsername('');
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSendRequest(username.trim());
      setUsername('');
      setSearchResults([]);
      setShowDropdown(false);
      setIsOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    console.log(status);
    switch (status) {
      case 'pending':
        return (
          <span className='flex items-center text-xs text-yellow-600 dark:text-yellow-500'>
            <Clock className='h-3 w-3 mr-1' />
            Pending
          </span>
        );
      case 'received':
        return (
          <span className='flex items-center text-xs text-blue-600 dark:text-blue-500'>
            <UserPlus className='h-3 w-3 mr-1' />
            Received
          </span>
        );
      case 'friends':
        return (
          <span className='flex items-center text-xs text-green-600 dark:text-green-500'>
            <Check className='h-3 w-3 mr-1' />
            Friends
          </span>
        );
      case 'declined':
        return (
          <span className='flex items-center text-xs text-red-600 dark:text-red-500'>
            <X className='h-3 w-3 mr-1' />
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='ml-2'>
          <UserPlus className='h-4 w-4 mr-1' />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Send Friend Request</DialogTitle>
            <DialogDescription>
              Search for users by username or name to send a friend request.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='space-y-4'>
              <div className='relative' ref={dropdownRef}>
                <Label htmlFor='username' className='mb-2 block'>
                  Search Users
                </Label>
                <div className='relative'>
                  <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Type username or name...'
                    className='pl-8'
                    autoComplete='off'
                  />
                  {isSearching && (
                    <Loader2 className='absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground' />
                  )}
                </div>
              </div>

              {/* User list below search */}
              <div className='space-y-2'>
                {showDropdown && searchResults.length > 0 && (
                  <div className='border rounded-md max-h-60 overflow-y-auto'>
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className='flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-accent transition-colors'
                      >
                        <div className='flex items-center space-x-3 min-w-0 flex-1'>
                          <Avatar className='h-10 w-10 shrink-0'>
                            <AvatarImage src='' alt={user.name} />
                            <AvatarFallback className='bg-zinc-700 text-white font-medium'>
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <p className='font-medium text-sm truncate'>
                              {user.name}
                            </p>
                            <p className='text-xs text-muted-foreground truncate'>
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <div className='shrink-0 ml-2'>
                          {user.status === 'none' ? (
                            <Button
                              size='sm'
                              onClick={() => handleSelectUser(user)}
                              className='h-8'
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className='h-4 w-4 mr-1 animate-spin' />
                              ) : (
                                <UserPlus className='h-4 w-4 mr-1' />
                              )}
                              Add
                            </Button>
                          ) : (
                            getStatusBadge(user.status)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showDropdown &&
                  !isSearching &&
                  searchResults.length === 0 &&
                  username.length >= 2 && (
                    <div className='border rounded-md p-4 text-center text-sm text-muted-foreground'>
                      No users found
                    </div>
                  )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
