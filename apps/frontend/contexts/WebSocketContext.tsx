'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { api } from '@/lib/axio';

type WebSocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
});

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(async () => {
    if (!user || !isAuthenticated || socketRef.current?.connected) return;

    try {
      // Fetch the latest user data including token
      const { data } = await api.get('/auth/me');

      if (!data) {
        throw new Error('Failed to fetch user data');
      }

      const { token } = data.data;

      if (!token) {
        throw new Error('No token found in response');
      }

      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Initialize new socket connection with the fresh token
      const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000', {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectDelay,
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        setIsConnected(false);

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(
            `Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`
          );
        }
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
        if (error.message === 'Invalid or expired JWT') {
          // Handle token expiration
          console.error('JWT token is invalid or expired');
        }
      });

      socketRef.current = socket;
      return socket;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      throw error;
    }
  }, [user, isAuthenticated]);

  // Connect on mount and when user/auth changes
  useEffect(() => {
    let socket: Socket | null = null;

    const setupSocket = async () => {
      if (isAuthenticated && user) {
        try {
          socket = await connect();
        } catch (error) {
          console.error('Failed to establish WebSocket connection:', error);
        }
      }
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [connect, isAuthenticated, user]);

  // Helper function to send messages
  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.error('Cannot send message: WebSocket not connected');
    }
  }, []);

  // Subscribe to events
  const subscribe = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
      }

      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    },
    []
  );

  // Expose the context value
  const value = {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    subscribe, // Expose subscribe method for components to listen to events
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
