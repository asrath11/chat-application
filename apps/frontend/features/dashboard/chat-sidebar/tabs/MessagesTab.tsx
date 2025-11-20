import React from 'react';
import { MessageList } from '../../message-list';
import { LoadingSpinner, ErrorDisplay } from '../../shared';
import { useAuthStore } from '@/stores/authStore';
import { useFriendStore } from '@/stores/friendStore';
import { useMessageStore } from '@/stores/messageStore';
import { useFriend } from '@/hooks/useFriend';

export function MessagesTab() {
    const { friends } = useFriend();
    const { selectFriend } = useFriendStore();
    const { clearUnread } = useMessageStore();
    const { isLoading, error } = useAuthStore();

    const handleChatSelect = (friendId: string) => {
        const friend = friends.find((f) => f.id === friendId);
        if (!friend) return;

        selectFriend(friend);
        clearUnread(friendId);
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;

    return <MessageList friends={friends} onSelectChat={handleChatSelect} />;
}
