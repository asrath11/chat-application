import { useWebSocket } from '@/contexts/WebSocketContext';

/**
 * Hook to access WebSocket connection status
 * The WebSocket service is automatically initialized by WebSocketProvider
 */
export const useWebSocketManager = () => {
  const { isConnected } = useWebSocket();

  return { isConnected };
};
