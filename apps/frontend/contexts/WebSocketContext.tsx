'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/axio';
import { websocketService } from '@/services/websocket.service';

type WebSocketContextType = {
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  sendMessage: () => { },
});

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectWebSocket = async () => {
      if (!user || !isAuthenticated) return;

      try {
        // Fetch the latest user data including token
        const { data } = await api.get('/auth/me');

        if (!data?.data?.token) {
          throw new Error('No token found in response');
        }

        const { token } = data.data;

        // Connect using websocketService
        websocketService.connect(token);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [user, isAuthenticated]);

  // Helper function to send messages
  const sendMessage = useCallback((event: string, data: any) => {
    if (websocketService.isConnected()) {
      websocketService.emit(event, data);
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
