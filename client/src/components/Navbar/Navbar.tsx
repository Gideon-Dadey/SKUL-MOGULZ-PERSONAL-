import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, Users, Rocket, MessageSquare, Bell, Search,
    ChevronDown, Settings, LogOut, HelpCircle,
    Sun, Moon, Plus, Grid3X3, TrendingUp, Bookmark
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import notificationService from '../../services/notificationService';
import logo from '../../assets/logo.png';
import './Navbar.css';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState<any[]>([]);
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

    useEffect(() => {
        const fetchNotifications = async () => {
            if (isAuthenticated) {
                try {
                    const data = await notificationService.getNotifications();
                    setNotifications(data);
                } catch (error) {
                    console.error("Failed to fetch notifications", error);
                }
            }
        };

        fetchNotifications();
    }, [isAuthenticated]);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket) return;

        socket.on('notification', (newNotification: any) => {
            setNotifications(prev => [newNotification, ...prev]);
        });

        return () => {
            socket.off('notification');
        };
    }, [socket]);

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
        { path: '/network', icon: Users, label: 'My Network' },
        { path: '/projects', icon: Rocket, label: 'Projects' },
        { path: '/messages', icon: MessageSquare, label: 'Messaging' },
    ];

    const isActive = (path: string) => location.pathname === path;

    if (!isAuthenticated) {
        return (
            <nav className="navbar navbar--guest">
                <div className="navbar__container">
                    <Link to="/" className="navbar__logo">
                        <img src={logo} alt="SKUL MOGULZ" className="navbar__logo-img" />
                        <span className="navbar__logo-text">SKUL MOGULZ</span>
                    </Link>
                    <div className="navbar__guest-actions">
                        <Link to="/login" className="navbar__guest-link">Sign in</Link>
                        <Link to="/register" className="btn btn-primary btn--sm">Join now</Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar">
            <div className="navbar__container">
                {/* Left Section */}
                <div className="navbar__left">
                    <Link to="/feed" className="navbar__logo">
                        <img src={logo} alt="SM" className="navbar__logo-img" />
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

                {/* Center Navigation */}
                <div className="navbar__center">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`navbar__nav-item ${isActive(item.path) ? 'navbar__nav-item--active' : ''}`}
                            data-tooltip={item.label}
                        >
                            <item.icon size={22} />
                            <span className="navbar__nav-label">{item.label}</span>
                            {isActive(item.path) && <div className="navbar__nav-indicator" />}
                        </Link>
                    ))}

                    {/* Notifications */}
                    <div className="navbar__nav-item-wrapper" ref={notificationRef}>
                        <button
                            className={`navbar__nav-item ${showNotifications ? 'navbar__nav-item--active' : ''}`}
                            onClick={() => setShowNotifications(!showNotifications)}
                            data-tooltip="Notifications"
                        >
                            <div className="navbar__notification-icon">
                                <Bell size={22} />
                                {unreadNotifications > 0 && (
                                    <span className="navbar__notification-badge">{unreadNotifications}</span>
                                )}
                            </div>
                            <span className="navbar__nav-label">Notifications</span>
                        </button>

                        {showNotifications && (
                            <div className="navbar__dropdown navbar__dropdown--notifications">
                                <div className="navbar__dropdown-header">
                                    <h3>Notifications</h3>
                                    <button className="navbar__dropdown-action" onClick={handleMarkAllRead}>Mark all as read</button>
                                </div>
                                <div className="navbar__dropdown-content">
                                    {notifications.length === 0 ? (
                                        <div className="navbar__dropdown-empty">No notifications yet</div>
                                    ) : notifications.slice(0, 10).map((n: any) => (
                                        <div
                                            key={n._id}
                                            className={`notification-item ${!n.isRead ? 'notification-item--unread' : ''}`}
                                            onClick={() => handleNotificationClick(n)}
                                        >
                                            <Link to={`/profile/${n.sender.username}`} onClick={(e) => e.stopPropagation()}>
                                                <img
                                                    src={n.sender?.avatar || `https://ui-avatars.com/api/?name=${n.sender.firstName}&background=ff6b4a&color=fff`}
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
                                <Link to="/notifications" className="navbar__dropdown-footer">
                                    View all notifications
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="navbar__right">
                    <Link to="/create-post" className="navbar__nav-item navbar__create-btn">
                        <Plus size={20} />
                        <span className="navbar__nav-label">Post</span>
                    </Link>

                    <button className="navbar__icon-btn navbar__theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Profile Menu */}
                    <div className="navbar__profile-wrapper" ref={profileMenuRef}>
                        <button
                            className={`navbar__nav-item navbar__profile-btn ${showProfileMenu ? 'navbar__profile-btn--active' : ''}`}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=ff6b4a&color=fff`}
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
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=ff6b4a&color=fff`}
                                        alt={user?.firstName}
                                        className="navbar__dropdown-user-avatar"
                                    />
                                    <div className="navbar__dropdown-user-info">
                                        <h4>{user?.firstName} {user?.lastName}</h4>
                                        <p>{user?.bio || 'Add a headline to your profile'}</p>
                                    </div>
                                </div>
                                <Link to="/profile" className="navbar__dropdown-view-profile">
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

                                <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={logout}>
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
