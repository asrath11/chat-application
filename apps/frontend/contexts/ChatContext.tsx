'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Friend {
    id: string;
    name: string;
    lastMessage?: string;
    unread: number;
    avatar?: string;
    time: string;
    username?: string;
}

interface ChatContextType {
    selectedFriend: Friend | null;
    setSelectedFriend: (friend: Friend | null) => void;
    selectFriendById: (friendId: string, friends: Friend[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    const selectFriendById = (friendId: string, friends: Friend[]) => {
        const friend = friends.find((f) => f.id === friendId);
        if (friend) {
            setSelectedFriend(friend);
        }
    };

    return (
        <ChatContext.Provider
            value={{ selectedFriend, setSelectedFriend, selectFriendById }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
