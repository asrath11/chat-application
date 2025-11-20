import { useCallback, useEffect, useRef, useState } from 'react';
import { websocketService } from '@/services/websocket.service';

export function useTypingIndicator(friendId: string) {
  const [isTyping, setIsTyping] = useState(false);
  const hasEmittedTypingRef = useRef(false);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const INACTIVITY_DELAY = 2500;

  const emitTyping = useCallback(() => {
    if (hasEmittedTypingRef.current) return;
    websocketService.emitTyping(friendId);
    hasEmittedTypingRef.current = true;
  }, [friendId]);

  const emitStopTyping = useCallback(() => {
    if (!hasEmittedTypingRef.current) return;
    websocketService.emitStopTyping(friendId);
    hasEmittedTypingRef.current = false;
  }, [friendId]);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  }, []);

  const scheduleInactivityStop = useCallback(() => {
    clearInactivityTimer();
    inactivityTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, INACTIVITY_DELAY);
  }, [clearInactivityTimer, emitStopTyping]);

  const handleLocalTyping = useCallback(
    (hasContent: boolean) => {
      if (hasContent) {
        emitTyping();
        scheduleInactivityStop();
      } else {
        emitStopTyping();
        clearInactivityTimer();
      }
    },
    [clearInactivityTimer, emitStopTyping, emitTyping, scheduleInactivityStop]
  );

  const handleInputBlur = useCallback(() => {
    emitStopTyping();
    clearInactivityTimer();
  }, [emitStopTyping]);

  const handleMessageSent = useCallback(() => {
    emitStopTyping();
    clearInactivityTimer();
  }, [clearInactivityTimer, emitStopTyping]);

  useEffect(() => {
    const onTyping = (data: any) => {
      if (data.from !== friendId) return;
      setIsTyping(true);
    };

    const onStopTyping = (data: any) => {
      if (data.from !== friendId) return;
      setIsTyping(false);
    };

    websocketService.on('typing', onTyping);
    websocketService.on('stop_typing', onStopTyping);

    return () => {
      websocketService.off('typing', onTyping);
      websocketService.off('stop_typing', onStopTyping);
    };
  }, [friendId]);
  6;

  useEffect(() => {
    setIsTyping(false);
    hasEmittedTypingRef.current = false;
    clearInactivityTimer();
    return () => {
      emitStopTyping();
      clearInactivityTimer();
    };
  }, [clearInactivityTimer, emitStopTyping, friendId]);

  return {
    isTyping,
    handleLocalTyping,
    handleInputBlur,
    handleMessageSent,
  };
}
