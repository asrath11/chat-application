export interface FriendRequest {
  id: string;
  name: string;
  avatar?: string;
  username: string;
  status?: 'pending' | 'accepted' | 'declined';
}

export interface Friend {
  id: string;
  name: string;
  lastMessage?: string;
  unread: number;
  avatar?: string;
  time: string;
  username?: string;
}
