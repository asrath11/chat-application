export type TabValue = 'messages' | 'received-requests' | 'sent-requests';

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

export interface CurrentUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface ChatSideBarProps {
  onSelectChat: React.Dispatch<React.SetStateAction<Friend | null>>;
  activeChatId?: string;
}
