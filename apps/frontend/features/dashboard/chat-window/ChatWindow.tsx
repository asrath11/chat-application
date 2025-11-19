import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Send, MoreVertical, Phone, Video } from 'lucide-react';
import { api } from '@/lib/axio';
import { websocketService } from '@/services/websocket.service';

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
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get(`/messages/${friendId}`);
                setMessages(data.data || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [friendId]);

    // WebSocket listener for new messages
    useEffect(() => {
        const onReceiveMessage = (msg: any) => {
            if (msg.fromUserId === friendId) {
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

                // Emit that messages have been read since chat is open
                websocketService.emit('messages_read', { friendId });
            }
        };

        websocketService.on('receive_message', onReceiveMessage);

        return () => {
            websocketService.off('receive_message', onReceiveMessage);
        };
    }, [friendId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        try {
            const { data } = await api.post('/messages', {
                recipientId: friendId,
                message: messageContent,
            });

            const newMsg = {
                id: data.data?.id || Date.now().toString(),
                content: messageContent,
                senderId: 'me',
                createdAt: data.data?.createdAt || new Date().toISOString(),
                isOwn: true,
            };

            setMessages((prev) => [...prev, newMsg]);

            // Emit WebSocket event for real-time delivery
            websocketService.emitMessage({
                recipientId: friendId,
                message: messageContent,
            });
        } catch (error) {
            console.error('Error sending message:', error);
            setNewMessage(messageContent);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

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
                        <p className='text-sm text-muted-foreground mt-2'>
                            Start the conversation with {friendName}
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${message.isOwn
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-accent text-accent-foreground'
                                    }`}
                            >
                                <p className='break-words'>{message.content}</p>
                                <p
                                    className={`text-xs mt-1 ${message.isOwn
                                        ? 'text-primary-foreground/70'
                                        : 'text-muted-foreground'
                                        }`}
                                >
                                    {formatTime(message.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='p-4 border-t'>
                <form onSubmit={handleSendMessage} className='flex items-center space-x-2'>
                    <Input
                        type='text'
                        placeholder='Type a message...'
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                        className='flex-1'
                    />
                    <Button type='submit' size='icon' disabled={!newMessage.trim() || isSending}>
                        <Send className='h-4 w-4' />
                    </Button>
                </form>
            </div>
        </div>
    );
}