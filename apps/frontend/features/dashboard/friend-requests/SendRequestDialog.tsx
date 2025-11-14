import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';

interface SendRequestDialogProps {
  onSendRequest: (username: string) => void;
}

export function SendRequestDialog({ onSendRequest }: SendRequestDialogProps) {
  const [username, setUsername] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSendRequest(username.trim());
      setUsername('');
      setIsOpen(false);
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
              Enter the username of the person you want to add as a friend.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='username' className='text-right'>
                Username
              </Label>
              <Input
                id='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Enter username'
                className='col-span-3'
                autoComplete='off'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>Send Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
