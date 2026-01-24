import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, Video, Edit, Phone, Image, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import messageService from '../../services/messageService';
import './MessagesPage.css';

const MessagesPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    // Fetch conversations on mount
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoadingConversations(true);
                const data = await messageService.getConversations();
                setConversations(data);
                if (data.length > 0 && !selectedChat) {
                    setSelectedChat(data[0]._id);
                }
            } catch (error) {
                console.error("Failed to fetch conversations", error);
            } finally {
                setLoadingConversations(false);
            }
        };

        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    // Listen for real-time messages
    useEffect(() => {
        if (!socket) return;

        socket.on('new_message', (message: any) => {
            // Update messages if the message belongs to the current chat
            if (message.sender._id === selectedChat || message.recipient === selectedChat) {
                setMessages((prev: any[]) => [...prev, message]);
            }

            // Also refresh conversations to show new snippet/unread status
            const refreshConversations = async () => {
                const data = await messageService.getConversations();
                setConversations(data);
            };
            refreshConversations();
        });

        return () => {
            socket.off('new_message');
        };
    }, [socket, selectedChat]);

    // Fetch messages when selectedChat changes
    useEffect(() => {
        if (!selectedChat) return;

        const fetchMessages = async () => {
            try {
                setLoadingMessages(true);
                const data = await messageService.getMessages(selectedChat);
                setMessages(data);
            } catch (error) {
                console.error("Failed to fetch messages", error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedChat]);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChat || !messageInput.trim()) return;

        const content = messageInput.trim();
        setMessageInput('');

        try {
            const newMessage = await messageService.sendMessage(selectedChat, content);
            setMessages([...messages, newMessage]);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const activeChatPartner = conversations.find(c => c._id === selectedChat)?.user;

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="messages-container">
            <div className="messages-layout">
                {/* Sidebar */}
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
                                    className={`msg-item ${selectedChat === conv._id ? 'active' : ''}`}
                                    onClick={() => setSelectedChat(conv._id)}
                                >
                                    <div className="msg-avatar-wrapper">
                                        <img
                                            src={conv.user.avatar || `https://ui-avatars.com/api/?name=${conv.user.firstName}&background=A5D6B7&color=fff`}
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

                {/* Main Chat Area */}
                <main className="messages-main">
                    {activeChatPartner ? (
                        <>
                            <header className="chat-header">
                                <div className="chat-user-info">
                                    <h3 className="chat-username">{activeChatPartner.firstName} {activeChatPartner.lastName}</h3>
                                    <span className="chat-status">
                                        {activeChatPartner.role === 'student' ? 'Student Entrepreneur' : 'Investor'}
                                    </span>
                                </div>
                                <div className="chat-actions">
                                    <button className="icon-btn"><MoreHorizontal size={20} /></button>
                                    <button className="icon-btn"><Video size={20} /></button>
                                    <button className="icon-btn"><Phone size={20} /></button>
                                </div>
                            </header>

                            <div className="chat-history" ref={historyRef}>
                                <div className="chat-divider"><span>Conversation started</span></div>

                                {messages.map((msg) => {
                                    const isSent = msg.sender === currentUser?.id;
                                    const senderInfo = isSent ? currentUser : activeChatPartner;
                                    return (
                                        <div key={msg._id} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                                            <img
                                                src={senderInfo?.avatar || `https://ui-avatars.com/api/?name=${senderInfo?.firstName}+${senderInfo?.lastName}&background=A5D6B7&color=fff`}
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

