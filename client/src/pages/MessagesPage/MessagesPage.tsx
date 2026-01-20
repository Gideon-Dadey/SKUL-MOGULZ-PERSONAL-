import React, { useState } from 'react';
import { Search, MoreHorizontal, Video, Edit, Phone, Image, Paperclip, Smile } from 'lucide-react';
import { mockUsers } from '../../data/mockData';
import './MessagesPage.css';

const MessagesPage: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState<string | null>(mockUsers[1].id);
    const [messageInput, setMessageInput] = useState('');

    const activeUser = mockUsers.find(u => u.id === selectedChat);

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
                        {mockUsers.map(user => (
                            <div
                                key={user.id}
                                className={`msg-item ${selectedChat === user.id ? 'active' : ''}`}
                                onClick={() => setSelectedChat(user.id)}
                            >
                                <div className="msg-avatar-wrapper">
                                    <img src={user.avatar} alt={user.firstName} className="msg-avatar" />
                                    <span className="msg-online-status"></span>
                                </div>
                                <div className="msg-preview">
                                    <div className="msg-row-top">
                                        <span className="msg-name">{user.firstName} {user.lastName}</span>
                                        <span className="msg-date">Dec 12</span>
                                    </div>
                                    <p className="msg-snippet">
                                        {user.role === 'investor' ? 'I would love to discuss your pitch deck...' : 'Hey, did you see the new update?'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="messages-main">
                    {activeUser ? (
                        <>
                            <header className="chat-header">
                                <div className="chat-user-info">
                                    <h3 className="chat-username">{activeUser.firstName} {activeUser.lastName}</h3>
                                    <span className="chat-status">{activeUser.role === 'student' ? 'Student Entrepreneur' : 'Investor'}</span>
                                </div>
                                <div className="chat-actions">
                                    <button className="icon-btn"><MoreHorizontal size={20} /></button>
                                    <button className="icon-btn"><Video size={20} /></button>
                                    <button className="icon-btn"><Phone size={20} /></button>
                                </div>
                            </header>

                            <div className="chat-history">
                                <div className="chat-divider"><span>Today</span></div>

                                <div className="message-bubble received">
                                    <img src={activeUser.avatar} className="bubble-avatar" />
                                    <div className="bubble-content">
                                        <p>Hi Alex! I saw your recent post about the EdTech project. It looks fascinating.</p>
                                        <span className="bubble-time">10:30 AM</span>
                                    </div>
                                </div>

                                <div className="message-bubble sent">
                                    <div className="bubble-content">
                                        <p>Thanks {activeUser.firstName}! We are working hard on the MVP. Would you like to see a demo?</p>
                                        <span className="bubble-time">10:45 AM</span>
                                    </div>
                                </div>

                                <div className="message-bubble received">
                                    <img src={activeUser.avatar} className="bubble-avatar" />
                                    <div className="bubble-content">
                                        <p>Absolutely! Are you free for a quick call this week?</p>
                                        <span className="bubble-time">11:00 AM</span>
                                    </div>
                                </div>
                            </div>

                            <footer className="chat-input-area">
                                <textarea
                                    placeholder="Write a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    rows={1}
                                />
                                <div className="chat-tools">
                                    <div className="tools-left">
                                        <button className="tool-btn"><Image size={18} /></button>
                                        <button className="tool-btn"><Paperclip size={18} /></button>
                                        <button className="tool-btn"><Smile size={18} /></button>
                                    </div>
                                    <div className="tools-right">
                                        <button className="send-btn" disabled={!messageInput.trim()}>
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="chat-empty-state">
                            <h3>Select a message</h3>
                            <p>Choose from your existing conversations, start a new one, or just keep swimming.</p>
                            <button className="btn btn-primary">New Message</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MessagesPage;
