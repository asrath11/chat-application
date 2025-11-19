import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Friend } from '@/types/friend.types';

interface FriendState {
  // State
  friends: Friend[];
  selectedFriend: Friend | null;

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
  
  // Actions - Reset
  reset: () => void;
}

const initialState = {
  friends: [],
  selectedFriend: null,
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
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === friendId ? { ...f, lastMessage: message, time } : f
          ),
        })),

      incrementUnread: (friendId) =>
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === friendId ? { ...f, unread: f.unread + 1 } : f
          ),
        })),

      clearUnread: (friendId) =>
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === friendId ? { ...f, unread: 0 } : f
          ),
        })),

      // Reset
      reset: () => set(initialState),
    }),
    { name: 'FriendStore' }
  )
);

// Selectors
export const selectFriendById = (friendId: string) => (state: FriendState) =>
  state.friends.find((f) => f.id === friendId);
