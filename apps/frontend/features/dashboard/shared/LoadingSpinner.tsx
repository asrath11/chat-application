import { Loader2 } from 'lucide-react';

export const LoadingSpinner = () => (
    <div
        className='flex justify-center items-center py-8'
        role='status'
        aria-label='Loading'
    >
        <Loader2 className='h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary' />
    </div>
);
