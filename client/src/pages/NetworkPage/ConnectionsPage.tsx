import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, MessageSquare, MoreHorizontal } from 'lucide-react';
import networkService from '../../services/networkService';
import { getImageUrl } from '../../services/api';
import './ConnectionsPage.css';

const ConnectionsPage: React.FC = () => {
    const [connections, setConnections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                setIsLoading(true);
                const data = await networkService.getConnections();
                setConnections(data);
            } catch (error) {
                console.error("Failed to fetch connections", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConnections();
    }, []);

    const filteredConnections = connections.filter(conn =>
        `${conn.firstName} ${conn.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.headline?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="connections-page">
            <div className="connections-container">
                <div className="connections-header">
                    <div className="connections-header__info">
                        <h1>{connections.length} Connections</h1>
                        <p>Manage your professional network</p>
                    </div>
                    <div className="connections-header__actions">
                        <div className="connections-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="connections-list">
                    {isLoading ? (
                        <div className="connections-loading">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : filteredConnections.length === 0 ? (
                        <div className="connections-empty">
                            <Users size={64} />
                            <h3>No connections found</h3>
                            <p>{searchQuery ? "Try a different search term" : "Your network is empty. Start connecting with peers!"}</p>
                            {!searchQuery && <Link to="/network" className="btn btn-primary">Find People</Link>}
                        </div>
                    ) : (
                        filteredConnections.map(connection => (
                            <div key={connection._id} className="connection-item">
                                <Link to={`/profile/${connection.username}`} className="connection-item__link">
                                    <img
                                        src={getImageUrl(connection.avatar) || `https://ui-avatars.com/api/?name=${connection.firstName}+${connection.lastName}&background=A5D6B7&color=fff`}
                                        alt={connection.firstName}
                                        className="connection-item__avatar"
                                    />
                                    <div className="connection-item__info">
                                        <h3>{connection.firstName} {connection.lastName}</h3>
                                        <p>{connection.headline || (connection.role === 'student' ? 'Student Entrepreneur' : 'Investor')}</p>
                                        <span className="connection-item__time">Connected 1 week ago</span>
                                    </div>
                                </Link>
                                <div className="connection-item__actions">
                                    <button className="btn btn-outline btn--sm">
                                        <MessageSquare size={16} /> Message
                                    </button>
                                    <div className="connection-item__more">
                                        <button className="btn btn-icon">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectionsPage;
