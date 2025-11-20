import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MessageMetadata {
  lastMessage?: string;
  unread: number;
  time: string;
}

interface MessageState {
  // State - Message metadata per friend
  messagesByFriend: Record<string, MessageMetadata>;
  
  // State - Typing indicators
  typingByFriend: Record<string, boolean>;

  // Actions - Messages & Unread
  updateLastMessage: (friendId: string, message: string, time: string) => void;
  incrementUnread: (friendId: string) => void;
  clearUnread: (friendId: string) => void;
  setMessageMetadata: (friendId: string, metadata: MessageMetadata) => void;
  removeMessageMetadata: (friendId: string) => void;

  // Actions - Typing indicators
  setTypingStatus: (friendId: string, isTyping: boolean) => void;
  clearTypingStatus: (friendId: string) => void;
  clearAllTypingStatuses: () => void;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  messagesByFriend: {} as Record<string, MessageMetadata>,
  typingByFriend: {} as Record<string, boolean>,
};

export const useMessageStore = create<MessageState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Messages & Unread
      updateLastMessage: (friendId, message, time) =>
        set((state) => {
          console.log('📝 Updating last message for friend:', friendId, message);
          return {
            messagesByFriend: {
              ...state.messagesByFriend,
              [friendId]: {
                ...state.messagesByFriend[friendId],
                lastMessage: message,
                time,
                unread: state.messagesByFriend[friendId]?.unread || 0,
              },
            },
          };
        }),

      incrementUnread: (friendId) =>
        set((state) => {
          console.log('🔔 Incrementing unread for friend:', friendId);
          const current = state.messagesByFriend[friendId];
          return {
            messagesByFriend: {
              ...state.messagesByFriend,
              [friendId]: {
                lastMessage: current?.lastMessage,
                time: current?.time || new Date().toISOString(),
                unread: (current?.unread || 0) + 1,
              },
            },
          };
        }),

      clearUnread: (friendId) =>
        set((state) => {
          const current = state.messagesByFriend[friendId];
          if (!current) return state;
          
          return {
            messagesByFriend: {
              ...state.messagesByFriend,
              [friendId]: {
                ...current,
                unread: 0,
              },
            },
          };
        }),

      setMessageMetadata: (friendId, metadata) =>
        set((state) => ({
          messagesByFriend: {
            ...state.messagesByFriend,
            [friendId]: metadata,
          },
        })),

      removeMessageMetadata: (friendId) =>
        set((state) => {
          const { [friendId]: _, ...rest } = state.messagesByFriend;
          return { messagesByFriend: rest };
        }),

      // Typing indicators
      setTypingStatus: (friendId, isTyping) =>
        set((state) => {
          const typingByFriend = { ...state.typingByFriend };
          if (isTyping) {
            typingByFriend[friendId] = true;
          } else {
            delete typingByFriend[friendId];
          }
          return { typingByFriend };
        }),

      clearTypingStatus: (friendId) =>
        set((state) => {
          const typingByFriend = { ...state.typingByFriend };
          delete typingByFriend[friendId];
          return { typingByFriend };
        }),

      clearAllTypingStatuses: () => set({ typingByFriend: {} }),

      // Reset
      reset: () => set(initialState),
    }),
    { name: 'MessageStore' }
  )
);

// Selectors
export const selectMessageMetadata = (friendId: string) => (state: MessageState) =>
  state.messagesByFriend[friendId];

export const selectIsTyping = (friendId: string) => (state: MessageState) =>
  state.typingByFriend[friendId] || false;
