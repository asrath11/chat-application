'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useInitializeChatData } from '@/hooks/useInitializeChatData';

interface ChatContextType {
    initialized: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    // Initialize chat data on mount
    useInitializeChatData();

    return (
        <ChatContext.Provider value={{ initialized: true }}>
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
