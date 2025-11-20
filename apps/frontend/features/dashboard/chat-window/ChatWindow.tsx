import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Send, MoreVertical, Phone, Video } from 'lucide-react';
import { websocketService } from '@/services/websocket.service';
import { messageService } from '@/services/message.service';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isOwn: boolean;
}

interface ChatWindowProps {
  friendId: string;
  friendName: string;
  friendAvatar?: string;
  friendUsername?: string;
}

export function ChatWindow({
  friendId,
  friendName,
  friendAvatar,
  friendUsername,
}: ChatWindowProps) {
  // ---------------------- STATE ---------------------- //
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isTyping, handleLocalTyping, handleInputBlur, handleMessageSent } =
    useTypingIndicator(friendId);

  // ---------------------- LOAD MESSAGES ---------------------- //
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const items = await messageService.getMessages(friendId);
        setMessages(items || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [friendId]);

  // ---------------------- SOCKET EVENTS ---------------------- //
  useEffect(() => {
    const handleIncoming = (msg: any) => {
      if (msg.fromUserId !== friendId) return;

      setMessages((prev) => [
        ...prev,
        {
          id: msg.id || Date.now().toString(),
          content: msg.message,
          senderId: msg.fromUserId,
          createdAt: msg.createdAt || new Date().toISOString(),
          isOwn: false,
        },
      ]);

      websocketService.emit('messages_read', { friendId });
    };

    websocketService.on('receive_message', handleIncoming);

    return () => {
      websocketService.off('receive_message', handleIncoming);
    };
  }, [friendId]);

  // ---------------------- AUTO-SCROLL ---------------------- //
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------------------- SEND MESSAGE ---------------------- //
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    handleMessageSent();

    try {
      const res = await messageService.sendMessage(friendId, messageContent);
      const id = res?.id || Date.now().toString();
      const createdAt = res?.createdAt || new Date().toISOString();

      const newMsg: Message = {
        id,
        content: messageContent,
        senderId: 'me',
        createdAt,
        isOwn: true,
      };

      setMessages((prev) => [...prev, newMsg]);

      websocketService.emitMessage({
        recipientId: friendId,
        message: messageContent,
        id,
        createdAt,
      });
    } catch {
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  // ---------------------- TIME FORMAT ---------------------- //
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diffHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);

    return diffHours < 24
      ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // ============================================================
  //                      RENDER UI
  // ============================================================
  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='p-4 border-b flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={friendAvatar} alt={friendName} />
            <AvatarFallback>{friendName.charAt(0)}</AvatarFallback>
          </Avatar>

          <div>
            <p className='font-semibold'>{friendName}</p>
            {friendUsername && (
              <p className='text-sm text-muted-foreground'>@{friendUsername}</p>
            )}
            {isTyping && (
              <p className='text-sm text-muted-foreground italic'>typing...</p>
            )}
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Button variant='ghost' size='icon'>
            <Phone className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon'>
            <Video className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon'>
            <MoreVertical className='h-5 w-5' />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-center'>
            <p className='text-muted-foreground'>No messages yet</p>
            <p className='text-sm mt-2'>
              Start the conversation with {friendName}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground'
                }`}
              >
                <p className='break-words'>{msg.content}</p>
                <p className='text-xs mt-1 opacity-70'>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='p-4 border-t'>
        <form
          onSubmit={handleSendMessage}
          className='flex items-center space-x-2'
        >
          <Input
            placeholder='Type a message...'
            value={newMessage}
            disabled={isSending}
            className='flex-1'
            onChange={(e) => {
              const value = e.target.value;
              setNewMessage(value);
              handleLocalTyping(value.trim().length > 0);
            }}
            onBlur={handleInputBlur}
          />

          <Button
            type='submit'
            size='icon'
            disabled={!newMessage.trim() || isSending}
          >
            <Send className='h-4 w-4' />
          </Button>
        </form>
      </div>
    </div>
  );
}
