import React from 'react';
import { FriendRequests } from '../../friend-requests';
import { LoadingSpinner, ErrorDisplay, EmptyState } from '../../shared';
import { useAuthStore } from '@/stores/authStore';
import { useFriend } from '@/hooks/useFriend';
import { useFriendRequestActions } from '@/hooks/useFriendRequestActions';

export function ReceivedRequestsTab() {
    const { receivedRequests } = useFriend();
    const { isLoading, error } = useAuthStore();
    const { acceptFriendRequest, declineFriendRequest, loadingRespondRequestId } =
        useFriendRequestActions();

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (!receivedRequests.length)
        return <EmptyState message="No pending friend requests" />;

    return (
        <FriendRequests
            friendRequests={receivedRequests}
            onAccept={acceptFriendRequest}
            onDecline={declineFriendRequest}
            loadingRequestId={loadingRespondRequestId}
        />
    );
}
