export const ErrorDisplay = ({ message }: { message: string }) => (
    <div className='text-center py-8 px-4' role='alert'>
        <p className='text-destructive text-xs sm:text-sm'>{message}</p>
    </div>
);
