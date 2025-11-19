export type TabValue = 'messages' | 'received-requests' | 'sent-requests';

export interface SearchedUser {
  id: string;
  username: string;
  name: string;
  status: 'none' | 'pending' | 'received' | 'friends';
}
