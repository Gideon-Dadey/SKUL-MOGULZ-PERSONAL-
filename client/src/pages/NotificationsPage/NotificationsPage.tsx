import React, { useState, useEffect } from 'react';
import { Settings, Bell, Heart, MessageSquareText, UserPlus, Zap, Repeat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import './NotificationsPage.css';

const NotificationsPage: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const data = await notificationService.getNotifications();
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={20} className="notif-icon notif-icon--like" />;
            case 'comment': return <MessageSquareText size={20} className="notif-icon notif-icon--comment" />;
            case 'funding': return <Zap size={20} className="notif-icon notif-icon--funding" />;
            case 'follow': return <UserPlus size={20} className="notif-icon notif-icon--follow" />;
            case 'repost': return <Repeat size={20} className="notif-icon notif-icon--repost" />;
            default: return <Bell size={20} className="notif-icon" />;
        }
    };

    return (
        <div className="notif-page-layout">
            <div className="notif-container">
                { }
                <aside className="notif-sidebar">
                    <div className="notif-card">
                        <div className="notif-card__header">
                            <h3>Manage your Notifications</h3>
                        </div>
                        <div className="notif-card__content">
                            <button className="notif-card__link">View Settings</button>
                        </div>
                    </div>
                </aside>

                { }
                <main className="notif-main">
                    <div className="notif-list-card">
                        {isLoading ? (
                            <div className="notif-loading">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-empty">
                                <Bell size={48} />
                                <h3>No notifications yet</h3>
                                <p>When you take action on SKUL MOGULZ, your notifications will appear here.</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`notif-item ${!n.isRead ? 'notif-item--unread' : ''}`}
                                    onClick={() => handleMarkAsRead(n._id)}
                                >
                                    <div className="notif-item__avatar-section">
                                        <img
                                            src={n.sender?.avatar || `https://ui-avatars.com/api/?name=${n.sender.firstName}+${n.sender.lastName}&background=A5D6B7&color=fff`}
                                            alt=""
                                            className="notif-item__avatar"
                                        />
                                        <div className="notif-item__type-icon">
                                            {getNotificationIcon(n.type)}
                                        </div>
                                    </div>
                                    <div className="notif-item__content">
                                        <p>
                                            <span className="notif-item__name">{n.sender.firstName} {n.sender.lastName}</span>
                                            {' '}
                                            {n.content ? n.content :
                                                (n.type === 'like' ? 'liked your project' :
                                                    n.type === 'comment' ? 'commented on your project' :
                                                        n.type === 'funding' ? 'supported your project' :
                                                            n.type === 'repost' ? 'reposted your project' :
                                                                'followed you')
                                            }
                                            {n.project && !n.content && <span className="notif-item__project-title">: "{n.project.title}"</span>}
                                        </p>
                                        <span className="notif-item__time">
                                            {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="notif-item__actions">
                                        <button className="notif-item__more">
                                            <Settings size={16} />
                                        </button>
                                        {!n.isRead && <div className="notif-item__unread-dot" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>

                { }
                <aside className="notif-sidebar-right">
                    <div className="notif-ad-card">
                        <span className="notif-ad-label">Ad</span>
                        <p>Grow your project with SKUL MOGULZ Premium</p>
                        <button className="btn btn-outline btn--sm">Learn More</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default NotificationsPage;
