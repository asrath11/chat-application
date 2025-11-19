import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CurrentUser } from '@/types/auth.types';

interface AuthState {
  // State
  currentUser: CurrentUser | null;
  isLoading: boolean;
  error: string | null;

  // Actions - UI State
  setCurrentUser: (user: CurrentUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Reset
  reset: () => void;
}

const initialState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      ...initialState,

      // UI State
      setCurrentUser: (user) => set({ currentUser: user }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Reset
      reset: () => set(initialState),
    }),
    { name: 'AuthStore' }
  )
);
