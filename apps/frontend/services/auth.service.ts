import { api } from '@/lib/axio';
import { CurrentUser } from '@/types/auth.types';

export const authService = {
  async getCurrentUser(): Promise<CurrentUser | null> {
    const { data } = await api.get('/auth/me');
    return data.data?.user || null;
  },

  async signout() {
    await api.post('/auth/signout');
  },
};
