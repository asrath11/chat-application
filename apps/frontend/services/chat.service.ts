import { api } from '@/lib/axio';
import { FriendRequest, Friend, CurrentUser } from '../types/chat.types';

export const chatService = {
  async getCurrentUser(): Promise<CurrentUser | null> {
    const { data } = await api.get('/auth/me');
    return data.data?.user || null;
  },

  async getFriends(): Promise<Friend[]> {
    const { data } = await api.get('/friends');
    return data.data || [];
  },

  async getSentRequests(): Promise<FriendRequest[]> {
    const { data } = await api.get('/friend-request/sent');
    return data.data || [];
  },

  async getReceivedRequests(): Promise<FriendRequest[]> {
    const { data } = await api.get('/friend-request/incoming');
    return data.data || [];
  },

  async searchUsers(query: string) {
    const { data } = await api.get(`/friend-request/search?query=${encodeURIComponent(query)}`);
    return data.data || [];
  },

  async sendFriendRequest(username: string) {
    const { data } = await api.post('/friend-request', { username });
    return data;
  },

  async respondToRequest(requestId: string, action: 'accept' | 'reject') {
    const { data } = await api.post('/friend-request/respond', {
      requestId,
      action,
    });
    return data;
  },

  async signout() {
    await api.post('/auth/signout');
  },
};
