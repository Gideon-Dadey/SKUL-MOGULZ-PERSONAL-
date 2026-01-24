import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, ChevronRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import networkService from '../../services/networkService';
import './NetworkPage.css';

const NetworkPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [invitations, setInvitations] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
    const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingInvitations(true);
                setIsLoadingSuggestions(true);

                const [invitesData, suggestionsData] = await Promise.all([
                    networkService.getInvitations(),
                    networkService.getSuggestions()
                ]);

                setInvitations(invitesData);
                setSuggestions(suggestionsData);
            } catch (error) {
                console.error("Failed to fetch network data", error);
            } finally {
                setIsLoadingInvitations(false);
                setIsLoadingSuggestions(false);
            }
        };

        fetchData();
    }, []);

    const handleAccept = async (requestId: string) => {
        try {
            await networkService.acceptRequest(requestId);
            setInvitations(prev => prev.filter(inv => inv._id !== requestId));
            
        } catch (error) {
            console.error("Failed to accept request", error);
        }
    };

    const handleIgnore = (requestId: string) => {
        
        setInvitations(prev => prev.filter(inv => inv._id !== requestId));
    };

    const handleConnect = async (userId: string) => {
        try {
            await networkService.sendRequest(userId);
            setConnectedMap({ ...connectedMap, [userId]: true });
        } catch (error) {
            console.error("Failed to send connection request", error);
        }
    };

    return (
        <div className="network-layout">
            {}
            <aside className="network-sidebar">
                <div className="network-card sidebar-menu">
                    <h3>Manage my network</h3>
                    <ul className="sidebar-menu-list">
                        <li>
                            <Link to="/connections" className="sidebar-menu-item">
                                <span className="menu-icon"><Users size={20} /></span>
                                <span className="menu-label">Connections</span>
                                <span className="menu-count">{currentUser?.connections?.length || 0}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/contacts" className="sidebar-menu-item">
                                <span className="menu-icon"><Briefcase size={20} /></span>
                                <span className="menu-label">Contacts</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/following" className="sidebar-menu-item">
                                <span className="menu-icon"><UserCheck size={20} /></span>
                                <span className="menu-label">Following & Followers</span>
                            </Link>
                        </li>
                    </ul>
                    <button className="sidebar-show-less">Show less <ChevronRight size={16} style={{ transform: 'rotate(-90deg)' }} /></button>
                </div>

                <div className="network-card ad-placeholder">
                    <span>Ad Placeholder</span>
                </div>
            </aside>

            {}
            <main className="network-main">
                {}
                {(invitations.length > 0 || isLoadingInvitations) && (
                    <div className="network-card">
                        <div className="card-header">
                            <h3>Invitations</h3>
                            <button className="btn-text">Manage</button>
                        </div>
                        <div className="invitations-list">
                            {isLoadingInvitations ? (
                                <div className="loading-state">Loading invitations...</div>
                            ) : invitations.length === 0 ? (
                                <div className="empty-state">No pending invitations</div>
                            ) : (
                                invitations.map(invitation => (
                                    <div key={invitation._id} className="invitation-item">
                                        <Link to={`/profile/${invitation.sender.username}`} className="invitation-link">
                                            <img
                                                src={invitation.sender.avatar || `https://ui-avatars.com/api/?name=${invitation.sender.firstName}&background=A5D6B7&color=fff`}
                                                alt=""
                                                className="invitation-avatar"
                                            />
                                            <div className="invitation-info">
                                                <span className="invitation-name">{invitation.sender.firstName} {invitation.sender.lastName}</span>
                                                <span className="invitation-headline">
                                                    {invitation.sender.headline || (invitation.sender.role === 'student' ? 'Student Founder' : 'Investor')}
                                                </span>
                                            </div>
                                        </Link>
                                        <div className="invitation-actions">
                                            <button className="btn btn-text" onClick={() => handleIgnore(invitation._id)}>Ignore</button>
                                            <button className="btn btn-outline" onClick={() => handleAccept(invitation._id)}>Accept</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {}
                <div className="network-card">
                    <div className="card-header">
                        <h3>People you may know</h3>
                        <button className="btn-text">See all</button>
                    </div>
                    <div className="suggestions-grid">
                        {isLoadingSuggestions ? (
                            <div className="loading-state">Finding peers...</div>
                        ) : suggestions.length === 0 ? (
                            <div className="empty-state">No new suggestions found</div>
                        ) : (
                            suggestions.map((user) => (
                                <div key={user._id} className="suggestion-card">
                                    <div className="suggestion-banner"></div>
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}&background=A5D6B7&color=fff`}
                                        alt=""
                                        className="suggestion-avatar"
                                    />
                                    <div className="suggestion-info">
                                        <Link to={`/profile/${user.username}`} className="suggestion-name">
                                            {user.firstName} {user.lastName}
                                        </Link>
                                        <span className="suggestion-headline">
                                            {user.headline || (user.role === 'student' ? 'Student Entrepreneur' : 'Investor')}
                                        </span>
                                        <span className="suggestion-mutual">
                                            <Users size={12} /> Community Member
                                        </span>
                                    </div>
                                    <button
                                        className={`btn ${connectedMap[user._id] ? 'btn-outline' : 'btn-primary-outline'} btn--stretch`}
                                        onClick={() => handleConnect(user._id)}
                                        disabled={connectedMap[user._id]}
                                    >
                                        {connectedMap[user._id] ? 'Pending' : 'Connect'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NetworkPage;

