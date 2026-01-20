import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, Users, Briefcase, MessageSquare, Bell, Search,
    ChevronDown, Settings, LogOut, User, HelpCircle,
    Sun, Moon, Plus, Grid3X3, TrendingUp, Bookmark
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { mockNotifications } from '../../data/mockData';
import './Navbar.css';

const Navbar: React.FC = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const unreadNotifications = mockNotifications.filter(n => !n.read).length;

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
        { path: '/projects', icon: Briefcase, label: 'Projects' },
        { path: '/messages', icon: MessageSquare, label: 'Messaging' },
    ];

    const isActive = (path: string) => location.pathname === path;

    if (!isAuthenticated) {
        return (
            <nav className="navbar navbar--guest">
                <div className="navbar__container">
                    <Link to="/" className="navbar__logo">
                        <div className="navbar__logo-icon">SM</div>
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
                        <div className="navbar__logo-icon">SM</div>
                    </Link>

                    <div className={`navbar__search ${searchFocused ? 'navbar__search--focused' : ''}`}>
                        <Search size={18} className="navbar__search-icon" />
                        <input
                            type="text"
                            placeholder="Search projects, people, posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="navbar__search-input"
                        />
                        {searchQuery && (
                            <kbd className="navbar__search-shortcut">⌘K</kbd>
                        )}
                    </div>
                </div>

                {/* Center Navigation */}
                <div className="navbar__center">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`navbar__nav-item ${isActive(item.path) ? 'navbar__nav-item--active' : ''}`}
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
                                    <button className="navbar__dropdown-action">Mark all as read</button>
                                </div>
                                <div className="navbar__dropdown-content">
                                    {mockNotifications.slice(0, 5).map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${!notification.read ? 'notification-item--unread' : ''}`}
                                        >
                                            <img
                                                src={notification.fromUser?.avatar || `https://ui-avatars.com/api/?name=User&background=ff6b4a&color=fff`}
                                                alt=""
                                                className="notification-item__avatar"
                                            />
                                            <div className="notification-item__content">
                                                <p>{notification.message}</p>
                                                <span className="notification-item__time">2h ago</span>
                                            </div>
                                            {!notification.read && <div className="notification-item__dot" />}
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
                    <Link to="/create-post" className="navbar__create-btn">
                        <Plus size={18} />
                        <span>Post</span>
                    </Link>

                    <button className="navbar__icon-btn" onClick={toggleTheme}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* Profile Menu */}
                    <div className="navbar__profile-wrapper" ref={profileMenuRef}>
                        <button
                            className="navbar__profile-btn"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=ff6b4a&color=fff`}
                                alt={user?.firstName}
                                className="navbar__profile-avatar"
                            />
                            <div className="navbar__profile-info">
                                <span className="navbar__profile-name">Me</span>
                                <ChevronDown size={14} />
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
