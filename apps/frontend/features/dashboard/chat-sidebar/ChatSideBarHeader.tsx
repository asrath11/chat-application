import { Settings, LogOut } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@workspace/ui/components/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';
import { CurrentUser } from '../../../types/auth.types';

interface ChatSideBarHeaderProps {
    currentUser: CurrentUser | null;
    onSignOut: () => void;
}

export const ChatSideBarHeader = ({
    currentUser,
    onSignOut,
}: ChatSideBarHeaderProps) => {
    const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || 'U';

    return (
        <header className='p-3 sm:p-4 border-b shrink-0'>
            <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1'>
                    <Avatar className='h-9 w-9 sm:h-10 sm:w-10 shrink-0'>
                        <AvatarImage
                            src={currentUser?.avatar}
                            alt={currentUser?.name || 'User'}
                        />
                        <AvatarFallback className='bg-zinc-700 text-white font-medium'>
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-xs sm:text-sm truncate'>
                            {currentUser?.name || 'Loading...'}
                        </p>
                        <p className='text-[10px] sm:text-xs text-muted-foreground truncate'>
                            @{currentUser?.username || '...'}
                        </p>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 sm:h-9 sm:w-9 shrink-0'
                            aria-label='Settings'
                        >
                            <Settings className='h-4 w-4 sm:h-[18px] sm:w-[18px]' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-48'>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onSignOut}>
                            <LogOut className='h-4 w-4 mr-2' />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
