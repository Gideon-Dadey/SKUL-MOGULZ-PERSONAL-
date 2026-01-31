import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, Users, Folder, Bell, Search,
    ChevronDown, Settings, LogOut, HelpCircle,
    Sun, Moon, Plus, Grid3X3, TrendingUp, Bookmark
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import notificationService from '../../services/notificationService';
import { getImageUrl } from '../../services/api';
import Logo, { DEFAULT_AVATAR } from '../Logo';
import { ModernChatIcon } from '../Icons';

import './Navbar.css';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const unreadNotifications = notifications.filter((n: any) => !n.isRead).length;

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const fetchUnreadCounts = async () => {
        if (isAuthenticated) {
            try {
                // Fetch notifications
                const notifData = await notificationService.getNotifications();
                setNotifications(notifData);

                // Fetch messages to count unread
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/messages/conversations`, {
                    headers: {
                        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`
                    }
                });
                if (response.ok) {
                    const conversations = await response.json();
                    const totalUnread = conversations.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
                    setUnreadMessages(totalUnread);
                }
            } catch (error) {
                console.error("Failed to fetch unread counts", error);
            }
        }
    };

    useEffect(() => {
        fetchUnreadCounts();
    }, [isAuthenticated, location.pathname]);

    useEffect(() => {
        window.addEventListener('unread-messages-update', fetchUnreadCounts);
        return () => window.removeEventListener('unread-messages-update', fetchUnreadCounts);
    }, [isAuthenticated]);


    useEffect(() => {
        if (!socket) return;

        socket.on('notification', (newNotification: any) => {
            setNotifications(prev => [newNotification, ...prev]);
        });

        socket.on('new_message', () => {
            // Only increment if we're not on the messages page or if it's from someone else
            if (location.pathname !== '/messages') {
                setUnreadMessages(prev => prev + 1);
            }
        });

        return () => {
            socket.off('notification');
            socket.off('new_message');
        };
    }, [socket, location.pathname]);

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleNotificationClick = async (n: any) => {
        if (!n.isRead) {
            try {
                await notificationService.markAsRead(n._id);
                setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, isRead: true } : item));
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }
        setShowNotifications(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { path: '/feed', icon: Home, label: 'Home' },
        { path: '/network', icon: Users, label: 'Network' },
        { path: '/projects', icon: Folder, label: 'Projects' },
        { path: '/messages', icon: ModernChatIcon, label: 'Messaging', badge: unreadMessages },
        { path: '/notifications', icon: Bell, label: 'Notifications', badge: unreadNotifications },
    ];

    const isActive = (path: string) => location.pathname === path;

    if (!isAuthenticated) {
        return (
            <nav className="navbar navbar--guest">
                <div className="navbar__container">
                    <Link to="/" className="navbar__logo">
                        <Logo size={32} />
                        <span className="navbar__logo-text">SKUL MOGULZ</span>
                    </Link>
                    <div className="navbar__guest-actions">
                        <Link to="/register" className="btn btn-primary btn--sm">Join now</Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar">
            <div className="navbar__container">
                { }
                <div className="navbar__left">
                    <Link to="/feed" className="navbar__logo">
                        <Logo size={32} />
                    </Link>

                    <div className={`navbar__search ${searchFocused ? 'navbar__search--focused' : ''}`}>
                        <Search size={18} className="navbar__search-icon" />
                        <input
                            type="text"
                            placeholder="Search projects, people, posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="navbar__search-input"
                        />
                    </div>
                </div>

                { }
                <div className="navbar__center">
                    {navItems.map(item => (
                        <div key={item.path} className="navbar__nav-item-wrapper"
                            ref={item.path === '/notifications' ? notificationRef : null}
                            onMouseEnter={() => item.path === '/notifications' && setShowNotifications(true)}
                            onMouseLeave={() => item.path === '/notifications' && setShowNotifications(false)}
                        >
                            <Link
                                to={item.path}
                                className={`navbar__nav-item ${isActive(item.path) ? 'navbar__nav-item--active' : ''}`}
                                data-tooltip={item.label}
                                onClick={() => item.path === '/notifications' && setShowNotifications(false)}
                            >
                                <div className="navbar__nav-icon-container">
                                    <item.icon size={22} color="currentColor" />
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="navbar__notification-badge">{item.badge}</span>
                                    )}
                                </div>
                                <span className="navbar__nav-label">{item.label}</span>
                                {isActive(item.path) && <div className="navbar__nav-indicator" />}
                            </Link>

                            {item.path === '/notifications' && showNotifications && (
                                <div className="navbar__dropdown navbar__dropdown--notifications">
                                    <div className="navbar__dropdown-header">
                                        <h3>Notifications</h3>
                                        <button className="navbar__dropdown-action" onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleMarkAllRead();
                                        }}>Mark all as read</button>
                                    </div>
                                    <div className="navbar__dropdown-content">
                                        {notifications.length === 0 ? (
                                            <div className="navbar__dropdown-empty">No notifications yet</div>
                                        ) : notifications.slice(0, 10).map((n: any) => (
                                            <div
                                                key={n._id}
                                                className={`notification-item ${!n.isRead ? 'notification-item--unread' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleNotificationClick(n);
                                                }}
                                            >
                                                <Link to={`/profile/${n.sender.username}`} onClick={(e) => e.stopPropagation()}>
                                                    <img
                                                        src={getImageUrl(n.sender?.avatar) || DEFAULT_AVATAR}
                                                        alt=""
                                                        className="notification-item__avatar"
                                                    />
                                                </Link>
                                                <div className="notification-item__content">
                                                    <p>
                                                        <strong>{n.sender.firstName} {n.sender.lastName}</strong>{' '}
                                                        {n.type === 'like' ? 'liked your project' :
                                                            n.type === 'comment' ? 'commented on your project' :
                                                                n.type === 'funding' ? 'supported your project' :
                                                                    'followed you'}
                                                        {n.project && <span>: "{n.project.title}"</span>}
                                                    </p>
                                                    <span className="notification-item__time">
                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {!n.isRead && <div className="notification-item__dot" />}
                                            </div>
                                        ))}
                                    </div>
                                    <Link to="/notifications" className="navbar__dropdown-footer" onClick={() => setShowNotifications(false)}>
                                        View all notifications
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                { }
                <div className="navbar__right">
                    <Link to="/create-post" className="navbar__nav-item navbar__create-btn">
                        <Plus size={20} />
                        <span className="navbar__nav-label">Post</span>
                    </Link>

                    { }
                    <div className="navbar__profile-wrapper" ref={profileMenuRef}>
                        <button
                            className={`navbar__nav-item navbar__profile-btn ${showProfileMenu ? 'navbar__profile-btn--active' : ''}`}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <img
                                src={getImageUrl(user?.avatar) || DEFAULT_AVATAR}
                                alt={user?.firstName}
                                className="navbar__profile-avatar"
                            />
                            <div className="navbar__profile-info">
                                <span className="navbar__nav-label">Me <ChevronDown size={12} style={{ marginLeft: '2px' }} /></span>
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="navbar__dropdown navbar__dropdown--profile">
                                <div className="navbar__dropdown-user">
                                    <img
                                        src={getImageUrl(user?.avatar) || DEFAULT_AVATAR}
                                        alt={user?.firstName}
                                        className="navbar__dropdown-user-avatar"
                                    />
                                    <div className="navbar__dropdown-user-info">
                                        <h4>{user?.firstName} {user?.lastName}</h4>
                                    </div>
                                </div>
                                <Link to={`/profile/${user?.username}`} className="navbar__dropdown-view-profile">
                                    View Profile
                                </Link>

                                <div className="navbar__dropdown-divider" />

                                <div className="navbar__dropdown-section">
                                    <h5>Account</h5>
                                    <Link to="/settings" className="navbar__dropdown-item">
                                        <Settings size={16} /> Settings & Privacy
                                    </Link>
                                    <Link to="/help" className="navbar__dropdown-item">
                                        <HelpCircle size={16} /> Help Center
                                    </Link>
                                    <Link to="/saved" className="navbar__dropdown-item">
                                        <Bookmark size={16} /> Saved Items
                                    </Link>
                                </div>

                                <div className="navbar__dropdown-divider" />

                                <div className="navbar__dropdown-section">
                                    <h5>Manage</h5>
                                    <Link to="/analytics" className="navbar__dropdown-item">
                                        <TrendingUp size={16} /> Analytics Dashboard
                                    </Link>
                                    <Link to="/my-projects" className="navbar__dropdown-item">
                                        <Grid3X3 size={16} /> My Projects
                                    </Link>
                                </div>

                                <div className="navbar__dropdown-divider" />

                                <div className="navbar__dropdown-section">
                                    <h5>Appearance</h5>
                                    <div className="navbar__theme-row">
                                        <div className="navbar__theme-info">
                                            {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                                            <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
                                        </div>
                                        <button
                                            className={`navbar__theme-switch ${theme === 'dark' ? 'navbar__theme-switch--active' : ''}`}
                                            onClick={toggleTheme}
                                            aria-label="Toggle theme"
                                        >
                                            <span className="navbar__theme-switch-thumb" />
                                        </button>
                                    </div>
                                </div>

                                <div className="navbar__dropdown-divider" />

                                <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={logout}>
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
