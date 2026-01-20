import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, ChevronRight, UserCheck } from 'lucide-react';
import { mockUsers } from '../../data/mockData';
import './NetworkPage.css';

const NetworkPage: React.FC = () => {
    // Generate some mock invitations (using existing users for demo)
    const invitations = [mockUsers[1], mockUsers[2]];

    // Generate suggestions (filtering out first few to simulate difference)
    const suggestions = [...mockUsers, ...mockUsers].slice(1, 9);

    const [ignoredMap, setIgnoredMap] = useState<Record<string, boolean>>({});
    const [acceptedMap, setAcceptedMap] = useState<Record<string, boolean>>({});
    const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});

    const handleAccept = (id: string) => {
        setAcceptedMap({ ...acceptedMap, [id]: true });
    };

    const handleIgnore = (id: string) => {
        setIgnoredMap({ ...ignoredMap, [id]: true });
    };

    const handleConnect = (id: string) => {
        setConnectedMap({ ...connectedMap, [id]: true });
    };

    return (
        <div className="network-layout">
            {/* Sidebar */}
            <aside className="network-sidebar">
                <div className="network-card sidebar-menu">
                    <h3>Manage my network</h3>
                    <ul className="sidebar-menu-list">
                        <li>
                            <Link to="/connections" className="sidebar-menu-item">
                                <span className="menu-icon"><Users size={20} /></span>
                                <span className="menu-label">Connections</span>
                                <span className="menu-count">287</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/contacts" className="sidebar-menu-item">
                                <span className="menu-icon"><Briefcase size={20} /></span>
                                <span className="menu-label">Contacts</span>
                                <span className="menu-count">140</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/following" className="sidebar-menu-item">
                                <span className="menu-icon"><UserCheck size={20} /></span>
                                <span className="menu-label">Following & Followers</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/groups" className="sidebar-menu-item">
                                <span className="menu-icon"><Users size={20} /></span>
                                <span className="menu-label">Groups</span>
                                <span className="menu-count">3</span>
                            </Link>
                        </li>
                    </ul>
                    <button className="sidebar-show-less">Show less <ChevronRight size={16} style={{ transform: 'rotate(-90deg)' }} /></button>
                </div>

                <div className="network-card ad-placeholder">
                    <span>Ad Placeholder</span>
                </div>
            </aside>

            {/* Main Content */}
            <main className="network-main">
                {/* Invitations */}
                {invitations.length > 0 && (
                    <div className="network-card">
                        <div className="card-header">
                            <h3>Invitations</h3>
                            <button className="btn-text">Manage</button>
                        </div>
                        <div className="invitations-list">
                            {invitations.map(user => !ignoredMap[user.id] && !acceptedMap[user.id] && (
                                <div key={user.id} className="invitation-item">
                                    <Link to={`/profile/${user.username}`} className="invitation-link">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}&background=getRandom&color=fff`}
                                            alt={user.firstName}
                                            className="invitation-avatar"
                                        />
                                        <div className="invitation-info">
                                            <span className="invitation-name">{user.firstName} {user.lastName}</span>
                                            <span className="invitation-headline">
                                                {user.role === 'student' ? 'Student Founder @ University' : 'Angel Investor'}
                                            </span>
                                            <span className="invitation-mutual">2 mutual connections</span>
                                        </div>
                                    </Link>
                                    <div className="invitation-actions">
                                        <button className="btn btn-text" onClick={() => handleIgnore(user.id)}>Ignore</button>
                                        <button className="btn btn-outline" onClick={() => handleAccept(user.id)}>Accept</button>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(acceptedMap).length === invitations.length && (
                                <div className="empty-state">No pending invitations</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Suggestions Grid */}
                <div className="network-card">
                    <div className="card-header">
                        <h3>People you may know</h3>
                        <button className="btn-text">See all</button>
                    </div>
                    <div className="suggestions-grid">
                        {suggestions.map((user, index) => (
                            <div key={`${user.id}-${index}`} className="suggestion-card">
                                <div className="suggestion-banner"></div>
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}&background=getRandom&color=fff`}
                                    alt={user.firstName}
                                    className="suggestion-avatar"
                                />
                                <div className="suggestion-info">
                                    <Link to={`/profile/${user.username}`} className="suggestion-name">
                                        {user.firstName} {user.lastName}
                                    </Link>
                                    <span className="suggestion-headline">
                                        {user.role === 'student' ? 'Student Entrepreneur' : 'Investor'}
                                    </span>
                                    <span className="suggestion-mutual">
                                        <Users size={12} /> {Math.floor(Math.random() * 20)} mutual connections
                                    </span>
                                </div>
                                <button
                                    className={`btn ${connectedMap[`${user.id}-${index}`] ? 'btn-outline' : 'btn-primary-outline'} btn--stretch`}
                                    onClick={() => handleConnect(`${user.id}-${index}`)}
                                >
                                    {connectedMap[`${user.id}-${index}`] ? 'Pending' : 'Connect'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Industry Leaders */}
                <div className="network-card">
                    <div className="card-header">
                        <h3>Top Voices in EdTech</h3>
                        <button className="btn-text">See all</button>
                    </div>
                    <div className="suggestions-grid">
                        {mockUsers.filter(u => u.role === 'investor').map((user) => (
                            <div key={user.id} className="suggestion-card">
                                <div className="suggestion-banner" style={{ background: 'linear-gradient(45deg, #1e293b, #334155)' }}></div>
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}&background=getRandom&color=fff`}
                                    alt={user.firstName}
                                    className="suggestion-avatar"
                                />
                                <div className="suggestion-info">
                                    <Link to={`/profile/${user.username}`} className="suggestion-name">
                                        {user.firstName} {user.lastName}
                                    </Link>
                                    <span className="suggestion-headline">
                                        {user.bio?.slice(0, 40)}...
                                    </span>
                                    <span className="suggestion-mutual">
                                        <Users size={12} /> 542K followers
                                    </span>
                                </div>
                                <button className="btn btn-outline btn--stretch">Follow</button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NetworkPage;
