import React from 'react';
import { SentRequestsList } from '../../friend-requests';
import { LoadingSpinner, ErrorDisplay, EmptyState } from '../../shared';
import { useAuthStore } from '@/stores/authStore';
import { useFriend } from '@/hooks/useFriend';

export function SentRequestsTab() {
    const { sentRequests } = useFriend();
    const { isLoading, error } = useAuthStore();

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (!sentRequests.length)
        return <EmptyState message="You haven't sent any requests" />;

    return <SentRequestsList requests={sentRequests} />;
}
