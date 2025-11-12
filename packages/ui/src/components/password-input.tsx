'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { InputHTMLAttributes } from 'react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;
export const PasswordInput = ({ className, ...props }: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className='relative'>
      <Input
        type={show ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={() => setShow(!show)}
        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
      >
        {show ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
        <span className='sr-only'>
          {show ? 'Hide password' : 'Show password'}
        </span>
      </Button>
    </div>
  );
};
