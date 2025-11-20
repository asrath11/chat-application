import { api } from '@/lib/axio';

export const messageService = {
  getMessages: async (friendId: string) => {
    const { data } = await api.get(`/messages/${friendId}`);
    return data.data || [];
  },
  sendMessage: async (friendId: string, message: string) => {
    const { data } = await api.post(`/messages`, {
      recipientId: friendId,
      message,
    });
    return data.data;
  },
  deleteMessage: async (messageId: string) => {
    const { data } = await api.delete(`/messages/${messageId}`);
    return data.data;
  },
};
