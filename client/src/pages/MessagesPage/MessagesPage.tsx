import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, Video, Edit, Phone, Image, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import messageService from '../../services/messageService';
import { getImageUrl } from '../../services/api';
import { DEFAULT_AVATAR } from '../../components/Logo';
import { ModernChatIcon } from '../../components/Icons';
import './MessagesPage.css';

const MessagesPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const { socket } = useSocket();
    const { startCall } = useCall();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!currentUser) return; // Don't poll if not logged in

        const fetchConversations = async () => {
            try {
                setLoadingConversations(true);
                const data = await messageService.getConversations();
                setConversations(data);
            } catch (error) {
                console.error("Failed to fetch conversations", error);
            } finally {
                setLoadingConversations(false);
            }
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [currentUser]); // Re-run when user changes


    useEffect(() => {
        if (!socket) return;

        socket.on('new_message', (message: any) => {
            console.log('Web Client received new_message:', message);
            const senderId = message.sender?._id || message.sender?.id || message.sender;
            const currentUserId = (currentUser as any)?._id || currentUser?.id;

            // Update messages if the message is from or to the person currently selected
            // Use String() to ensure ObjectIds and Strings are comparable
            const isFromSelected = String(senderId) === String(selectedChat);
            const isToSelectedFromMe = String(message.recipient) === String(selectedChat) && String(senderId) === String(currentUserId);

            if (isFromSelected || isToSelectedFromMe) {
                setMessages((prev: any[]) => {
                    // Prevent duplicates
                    if (prev.find(m => String(m._id) === String(message._id))) return prev;
                    return [...prev, message];
                });
            }


            const refreshConversations = async () => {
                try {
                    const data = await messageService.getConversations();
                    setConversations(data);
                } catch (error) {
                    console.error("Failed to refresh conversations on new message", error);
                }
            };
            refreshConversations();
        });

        return () => {
            socket.off('new_message');
        };
    }, [socket, selectedChat, currentUser]);


    useEffect(() => {
        if (!selectedChat || !currentUser) return;

        const fetchMessages = async () => {
            try {
                setLoadingMessages(true);
                console.log('Fetching messages for chat partner:', selectedChat);
                const data = await messageService.getMessages(selectedChat);
                setMessages(data);

                // Refresh conversations to update unread counts in the sidebar and navbar
                const updatedConvs = await messageService.getConversations();
                setConversations(updatedConvs);

                // Notify Navbar to refresh its unread badge
                window.dispatchEvent(new Event('unread-messages-update'));
            } catch (error) {
                console.error("Failed to fetch messages", error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedChat, (currentUser as any)?._id || currentUser?.id]);


    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSendMessage triggered. SelectedChat:', selectedChat, 'Input:', messageInput);

        if (!selectedChat || !messageInput.trim()) {
            console.warn('Cannot send: missing chat selection or empty input');
            return;
        }

        const content = messageInput.trim();
        setMessageInput('');
        console.log('Sending message to:', selectedChat, 'Content:', content);

        try {
            const newMessage = await messageService.sendMessage(selectedChat, content);
            console.log('Message sent successfully:', newMessage);
            setMessages(prev => [...prev, newMessage]);
        } catch (error) {
            console.error("Failed to send message", error);
            setMessageInput(content); // Restore input on failure
            alert('Failed to send message. Please check your connection.');
        }
    };

    const activeChatPartner = conversations.find(c => String(c._id) === String(selectedChat))?.user;

    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="messages-container">
            <div className="messages-layout">
                <aside className="messages-sidebar">
                    <header className="msg-sidebar-header">
                        <h2>Messaging</h2>
                        <div className="msg-header-actions">
                            <button className="icon-btn"><MoreHorizontal size={20} /></button>
                            <button className="icon-btn"><Edit size={20} /></button>
                        </div>
                    </header>

                    <div className="msg-search">
                        <Search size={16} className="msg-search-icon" />
                        <input type="text" placeholder="Search messages" />
                    </div>

                    <div className="msg-list">
                        {loadingConversations ? (
                            <div className="msg-loading">Loading chats...</div>
                        ) : conversations.length === 0 ? (
                            <div className="msg-empty">No conversations yet</div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv._id}
                                    className={`msg-item ${String(selectedChat) === String(conv._id) ? 'active' : ''}`}
                                    onClick={() => setSelectedChat(conv._id)}
                                >
                                    <div className="msg-avatar-wrapper">
                                        <img
                                            src={getImageUrl(conv.user.avatar) || DEFAULT_AVATAR}
                                            alt=""
                                            className="msg-avatar"
                                        />
                                        {conv.unreadCount > 0 && <span className="msg-unread-dot">{conv.unreadCount}</span>}
                                    </div>
                                    <div className="msg-preview">
                                        <div className="msg-row-top">
                                            <span className="msg-name">{conv.user.firstName} {conv.user.lastName}</span>
                                            <span className="msg-date">
                                                {new Date(conv.lastMessageDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="msg-snippet">
                                            {conv.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                <main className="messages-main">
                    {activeChatPartner ? (
                        <>
                            <header className="chat-header">
                                <div className="chat-user-info">
                                    <h3 className="chat-username">
                                        {activeChatPartner.firstName} {activeChatPartner.lastName}
                                        <span className={`connection-status-dot ${socket?.connected ? 'connected' : 'disconnected'}`} title={socket?.connected ? 'Real-time connected' : 'Connecting to real-time...'}></span>
                                    </h3>
                                    <span className="chat-status">
                                        {activeChatPartner.role === 'student' ? 'Student Entrepreneur' : 'Investor'}
                                    </span>
                                </div>
                                <div className="chat-actions">
                                    <button className="icon-btn" title="More options"><MoreHorizontal size={20} /></button>
                                    <button className="icon-btn" onClick={() => startCall(activeChatPartner._id || activeChatPartner.id, activeChatPartner.firstName, activeChatPartner.avatar, true)} title="Video call">
                                        <Video size={20} />
                                    </button>
                                    <button className="icon-btn" onClick={() => startCall(activeChatPartner._id || activeChatPartner.id, activeChatPartner.firstName, activeChatPartner.avatar, false)} title="Audio call">
                                        <Phone size={20} />
                                    </button>
                                </div>
                            </header>

                            <div className="chat-history" ref={historyRef}>
                                <div className="chat-divider"><span>Conversation started</span></div>

                                {messages.map((msg) => {
                                    const msgSenderId = msg.sender?._id || msg.sender?.id || msg.sender;
                                    const currentUserId = (currentUser as any)?._id || currentUser?.id;
                                    const isSent = String(msgSenderId) === String(currentUserId);
                                    const senderInfo = isSent ? currentUser : activeChatPartner;
                                    return (
                                        <div key={msg._id} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                                            <img
                                                src={getImageUrl(senderInfo?.avatar) || DEFAULT_AVATAR}
                                                className="bubble-avatar"
                                                alt=""
                                            />
                                            <div className="bubble-content">
                                                <p>{msg.content}</p>
                                                <span className="bubble-time">{formatTime(msg.createdAt)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {loadingMessages && messages.length === 0 && (
                                    <div className="chat-loading">Loading messages...</div>
                                )}
                            </div>

                            <footer className="chat-input-area">
                                <form onSubmit={handleSendMessage} className="chat-form-wrapper">
                                    <textarea
                                        placeholder="Write a message..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        rows={1}
                                    />
                                    <div className="chat-tools">
                                        <div className="tools-left">
                                            <button type="button" className="tool-btn"><Image size={18} /></button>
                                            <button type="button" className="tool-btn"><Paperclip size={18} /></button>
                                            <button type="button" className="tool-btn"><Smile size={18} /></button>
                                        </div>
                                        <div className="tools-right">
                                            <button type="submit" className="send-btn" disabled={!messageInput.trim()}>
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </footer>
                        </>
                    ) : (
                        <div className="chat-empty-state">
                            <ModernChatIcon size={64} color="var(--primary)" style={{ marginBottom: '24px', opacity: 0.2 }} />
                            <h3>Select a message</h3>
                            <p>Choose from your existing conversations or start a new one to connect with entrepreneurs and investors.</p>
                            <button className="btn btn-primary">Start New Chat</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MessagesPage;

