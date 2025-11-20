import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Friend } from '@/types/friend.types';

interface FriendState {
  // State
  friends: Friend[];
  selectedFriend: Friend | null;
  typingByFriend: Record<string, boolean>;

  // Actions - Friends
  setFriends: (friends: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  updateFriend: (friendId: string, updates: Partial<Friend>) => void;
  removeFriend: (friendId: string) => void;

  // Actions - Selected Friend
  selectFriend: (friend: Friend | null) => void;
  selectFriendById: (friendId: string) => void;

  // Actions - Messages & Unread
  updateLastMessage: (friendId: string, message: string, time: string) => void;
  incrementUnread: (friendId: string) => void;
  clearUnread: (friendId: string) => void;

  // Actions - Typing indicators
  setTypingStatus: (friendId: string, isTyping: boolean) => void;
  clearTypingStatus: (friendId: string) => void;
  clearAllTypingStatuses: () => void;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  friends: [],
  selectedFriend: null,
  typingByFriend: {} as Record<string, boolean>,
};

export const useFriendStore = create<FriendState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Friends
      setFriends: (friends) => set({ friends }),

      addFriend: (friend) =>
        set((state) => {
          if (state.friends.some((f) => f.id === friend.id)) return state;
          return { friends: [friend, ...state.friends] };
        }),

      updateFriend: (friendId, updates) =>
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === friendId ? { ...f, ...updates } : f
          ),
        })),

      removeFriend: (friendId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== friendId),
        })),

      // Selected Friend
      selectFriend: (friend) => set({ selectedFriend: friend }),

      selectFriendById: (friendId) => {
        const friend = get().friends.find((f) => f.id === friendId);
        if (friend) {
          set({ selectedFriend: friend });
        }
      },

      // Messages & Unread
      updateLastMessage: (friendId, message, time) =>
        set((state) => {
          console.log('📝 Updating last message for friend:', friendId, message);
          const updatedFriends = state.friends.map((f) =>
            f.id === friendId ? { ...f, lastMessage: message, time } : f
          );

          // Also update selectedFriend if it's the same friend
          const updatedSelectedFriend =
            state.selectedFriend?.id === friendId
              ? updatedFriends.find((f) => f.id === friendId) ||
                state.selectedFriend
              : state.selectedFriend;

          return {
            friends: updatedFriends,
            selectedFriend: updatedSelectedFriend,
          };
        }),

      incrementUnread: (friendId) =>
        set((state) => {
          console.log('🔔 Incrementing unread for friend:', friendId);
          return {
            friends: state.friends.map((f) =>
              f.id === friendId ? { ...f, unread: f.unread + 1 } : f
            ),
          };
        }),

      clearUnread: (friendId) =>
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === friendId ? { ...f, unread: 0 } : f
          ),
        })),

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
    { name: 'FriendStore' }
  )
);

// Selectors
export const selectFriendById = (friendId: string) => (state: FriendState) =>
  state.friends.find((f) => f.id === friendId);
