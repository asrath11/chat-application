import { Search } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';

interface ChatSideBarSearchProps {
    value: string;
    onChange: (value: string) => void;
}

export const ChatSideBarSearch = ({
    value,
    onChange,
}: ChatSideBarSearchProps) => {
    return (
        <div className='p-3 sm:p-4 border-b shrink-0'>
            <div className='relative'>
                <Search
                    className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none'
                    aria-hidden='true'
                />
                <Input
                    type='search'
                    placeholder='Search or start a new chat'
                    className='w-full pl-9 sm:pl-10 text-xs sm:text-sm h-9 sm:h-10 bg-accent/50'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label='Search chats'
                />
            </div>
        </div>
    );
};
