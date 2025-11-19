import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FriendRequest } from '@/types/friend.types';

interface FriendRequestState {
  // State
  sentRequests: FriendRequest[];
  receivedRequests: FriendRequest[];

  // Actions - Sent Requests
  setSentRequests: (requests: FriendRequest[]) => void;
  updateSentRequestStatus: (requestId: string, status: 'pending' | 'accepted' | 'declined') => void;
  removeSentRequest: (requestId: string) => void;

  // Actions - Received Requests
  setReceivedRequests: (requests: FriendRequest[]) => void;
  addReceivedRequest: (request: FriendRequest) => void;
  removeReceivedRequest: (requestId: string) => void;

  // Actions - General
  removeRequest: (requestId: string) => void;
  reset: () => void;
}

const initialState = {
  sentRequests: [],
  receivedRequests: [],
};

export const useFriendRequestStore = create<FriendRequestState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Sent Requests
      setSentRequests: (requests) => set({ sentRequests: requests }),

      updateSentRequestStatus: (requestId, status) =>
        set((state) => ({
          sentRequests: state.sentRequests.map((r) =>
            r.id === requestId ? { ...r, status } : r
          ),
        })),

      removeSentRequest: (requestId) =>
        set((state) => ({
          sentRequests: state.sentRequests.filter((r) => r.id !== requestId),
        })),

      // Received Requests
      setReceivedRequests: (requests) => set({ receivedRequests: requests }),

      addReceivedRequest: (request) =>
        set((state) => {
          if (state.receivedRequests.some((r) => r.id === request.id)) return state;
          return { receivedRequests: [request, ...state.receivedRequests] };
        }),

      removeReceivedRequest: (requestId) =>
        set((state) => ({
          receivedRequests: state.receivedRequests.filter((r) => r.id !== requestId),
        })),

      // General
      removeRequest: (requestId) =>
        set((state) => ({
          sentRequests: state.sentRequests.filter((r) => r.id !== requestId),
          receivedRequests: state.receivedRequests.filter((r) => r.id !== requestId),
        })),

      reset: () => set(initialState),
    }),
    { name: 'FriendRequestStore' }
  )
);

// Selectors
export const selectTotalReceivedRequests = (state: FriendRequestState) =>
  state.receivedRequests.length;

export const selectTotalSentRequests = (state: FriendRequestState) =>
  state.sentRequests.length;
