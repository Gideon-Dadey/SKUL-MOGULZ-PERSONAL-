import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../services/api';
import { Link } from 'react-router-dom';
import {
    Plus, TrendingUp, Image, Calendar, FileText,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/PostCard/PostCard';
import SearchFilter from '../../components/SearchFilter/SearchFilter';
import { DEFAULT_AVATAR } from '../../components/Logo';
import networkService from '../../services/networkService';
import { ProjectCategory } from '../../types';
import './FeedPage.css';

type SortOption = 'trending' | 'recent' | 'popular';

const FeedPage: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
    const [selectedStage, setSelectedStage] = useState('all');
    const [sortBy, setSortBy] = useState<SortOption>('recent');

    useEffect(() => {
        refreshUser();
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const data = await networkService.getSuggestions();
                setSuggestions(data.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };
        fetchSuggestions();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                let url = '/projects?';
                if (selectedCategory !== 'all') url += `category=${selectedCategory}&`;
                if (selectedStage !== 'all') url += `stage=${selectedStage}&`;
                if (searchQuery) url += `search=${searchQuery}&`;

                const response = await api.get(url);


                const adaptedPosts = response.data.map((p: any) => ({
                    ...p,
                    id: p._id || p.id,
                    likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
                    likedBy: Array.isArray(p.likes) ? p.likes : [],
                    comments: (p.comments || []).map((c: any) => ({
                        ...c,
                        id: c._id || c.id,
                        author: { ...c.author, id: c.author?._id || c.author?.id }
                    })),
                    author: {
                        ...p.author,
                        id: p.author?._id || p.author?.id
                    }
                }));


                let sortedPosts = [...adaptedPosts];
                switch (sortBy) {
                    case 'trending':
                        sortedPosts.sort((a, b) => (b.likes + b.comments.length * 2) - (a.likes + a.comments.length * 2));
                        break;
                    case 'popular':
                        sortedPosts.sort((a, b) => b.likes - a.likes);
                        break;
                    case 'recent':
                    default:
                        sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                }

                setPosts(sortedPosts);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [selectedCategory, selectedStage, searchQuery, sortBy]);

    const handleLike = async (postId: string) => {
        try {
            const response = await api.put(`/projects/${postId}/like`);
            const updatedLikes = response.data;

            setPosts(currentPosts => currentPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: updatedLikes.length,
                        likedBy: updatedLikes
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error("Failed to like post", error);
        }
    };

    const handleDeletePost = (postId: string) => {
        setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
    };

    return (
        <div className="feed-layout">
            { }
            <aside className="feed-sidebar feed-sidebar--left">
                <div className="profile-card">
                    <div className="profile-card__banner"></div>
                    <img
                        src={getImageUrl(user?.avatar) || DEFAULT_AVATAR}
                        alt={user?.firstName}
                        className="profile-card__avatar"
                    />
                    <div className="profile-card__info">
                        <h3>{user?.firstName} {user?.lastName}</h3>
                        <p>{user?.bio || 'Add a headline to stand out'}</p>
                    </div>
                    <div className="profile-card__stats">
                        <Link to="/network" className="profile-card__stat">
                            <span className="profile-card__stat-label">Connections</span>
                            <span className="profile-card__stat-value">
                                {Number(user?.connectionsCount ?? user?.connections?.length ?? 0)}
                            </span>
                        </Link>
                        <Link to={`/profile/${user?.username}`} className="profile-card__stat">
                            <span className="profile-card__stat-label">Profile views</span>
                            <span className="profile-card__stat-value">
                                {Number(user?.viewedProfile ?? 0)}
                            </span>
                        </Link>
                    </div>
                    <div className="profile-card__actions">
                        <Link to="/saved" className="profile-card__action">
                            <FileText size={16} /> Saved items
                        </Link>
                        <Link to="/my-projects" className="profile-card__action">
                            <TrendingUp size={16} /> My Projects
                        </Link>
                    </div>
                </div>

                <div className="sidebar-card">
                    <div className="sidebar-card__header">
                        <h4>Recent</h4>
                    </div>
                    <div className="sidebar-card__list">
                        <a href="#" className="sidebar-card__item"># EdTech</a>
                        <a href="#" className="sidebar-card__item"># AI Startups</a>
                        <a href="#" className="sidebar-card__item"># FinTech</a>
                        <a href="#" className="sidebar-card__item"># Healthcare Innovation</a>
                    </div>
                </div>

                <div className="sidebar-card">
                    <div className="sidebar-card__header">
                        <h4>Communities</h4>
                        <Plus size={16} className="sidebar-card__add" />
                    </div>
                    <div className="sidebar-card__list">
                        <a href="#" className="sidebar-card__item">Gen-Z Founders</a>
                        <a href="#" className="sidebar-card__item">Student Entrepreneurs</a>
                        <a href="#" className="sidebar-card__item">Angel Investors Network</a>
                    </div>
                </div>
            </aside>

            { }
            <main className="feed-main">
                { }
                <div className="create-box">
                    <div className="create-box__top">
                        <img
                            src={getImageUrl(user?.avatar) || DEFAULT_AVATAR}
                            alt=""
                            className="create-box__avatar"
                        />
                        <Link to="/create-post" className="create-box__input">
                            Share a project update...
                        </Link>
                    </div>
                    <div className="create-box__actions">
                        <button className="create-box__action">
                            <Image size={20} className="create-box__icon create-box__icon--blue" />
                            <span>Media</span>
                        </button>
                        <button className="create-box__action">
                            <Calendar size={20} className="create-box__icon create-box__icon--orange" />
                            <span>Event</span>
                        </button>
                        <button className="create-box__action">
                            <FileText size={20} className="create-box__icon create-box__icon--coral" />
                            <span>Article</span>
                        </button>
                    </div>
                </div>

                { }
                <div className="feed-sort-bar">
                    <div className="feed-sort-bar__line"></div>
                    <span className="feed-sort-bar__text">Sort by:</span>
                    <button
                        className="feed-sort-bar__dropdown"
                        onClick={() => {
                            if (sortBy === 'recent') setSortBy('trending');
                            else if (sortBy === 'trending') setSortBy('popular');
                            else setSortBy('recent');
                        }}
                    >
                        {sortBy === 'recent' ? 'Most Recent' : sortBy === 'trending' ? 'Trending' : 'Most Popular'}
                        <ChevronDown size={16} />
                    </button>
                </div>

                { }
                <SearchFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    selectedStage={selectedStage}
                    onStageChange={setSelectedStage}
                />

                { }
                <div className="feed-posts">
                    {isLoading ? <div style={{ padding: '20px', textAlign: 'center' }}>Loading posts...</div> : posts.map(post => (
                        <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDeletePost} />
                    ))}
                </div>
            </main>

            { }
            <aside className="feed-sidebar feed-sidebar--right">
                <div className="news-card">
                    <div className="news-card__header">
                        <h4>Platform Insights</h4>
                    </div>
                    <ul className="news-card__list">
                        <li className="news-card__item">
                            <span className="news-card__bullet"></span>
                            <div>
                                <p className="news-card__title">EdTech projects up 34% this quarter</p>
                                <span className="news-card__meta">2h ago • 1,234 readers</span>
                            </div>
                        </li>
                        <li className="news-card__item">
                            <span className="news-card__bullet"></span>
                            <div>
                                <p className="news-card__title">New AI integration features launched</p>
                                <span className="news-card__meta">5h ago • 892 readers</span>
                            </div>
                        </li>
                        <li className="news-card__item">
                            <span className="news-card__bullet"></span>
                            <div>
                                <p className="news-card__title">Top 10 funded projects of January</p>
                                <span className="news-card__meta">1d ago • 3,421 readers</span>
                            </div>
                        </li>
                        <li className="news-card__item">
                            <span className="news-card__bullet"></span>
                            <div>
                                <p className="news-card__title">Stanford demo day success stories</p>
                                <span className="news-card__meta">2d ago • 2,156 readers</span>
                            </div>
                        </li>
                    </ul>
                    <button className="news-card__more">Show more</button>
                </div>

                <div className="suggestions-card">
                    <div className="suggestions-card__header">
                        <h4>People you may know</h4>
                    </div>
                    {isLoadingSuggestions ? (
                        <div className="suggestion-loading">Loading...</div>
                    ) : suggestions.length === 0 ? (
                        <div className="suggestion-empty">No suggestions found</div>
                    ) : (
                        suggestions.map(person => (
                            <div key={person._id} className="suggestion-item">
                                <img
                                    src={getImageUrl(person.avatar) || DEFAULT_AVATAR}
                                    alt=""
                                    className="suggestion-item__avatar"
                                />
                                <div className="suggestion-item__info">
                                    <h5>{person.firstName} {person.lastName}</h5>
                                    <p>{person.headline || (person.role === 'student' ? 'Student Entrepreneur' : 'Investor')}</p>
                                    <button
                                        className="suggestion-item__connect"
                                        onClick={async () => {
                                            try {
                                                await networkService.sendRequest(person._id);
                                                setSuggestions(prev => prev.filter(p => p._id !== person._id));
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }}
                                    >
                                        <Plus size={14} /> Connect
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="ad-card">
                    <span className="ad-card__label">Promoted</span>
                    <div className="ad-card__content">
                        <h4>Launch your startup with SKUL MOGULZ</h4>
                        <p>Get funding, mentorship, and connections to top investors.</p>
                        <button className="btn btn-primary btn--sm">Learn More</button>
                    </div>
                </div>

                <footer className="feed-footer">
                    <div className="feed-footer__links">
                        <a href="#">About</a>
                        <a href="#">Accessibility</a>
                        <a href="#">Help Center</a>
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                    </div>
                    <div className="feed-footer__brand">
                        <div className="navbar__logo-icon" style={{ width: 20, height: 20, fontSize: '0.5rem' }}>SM</div>
                        <span>SKUL MOGULZ © 2026</span>
                    </div>
                </footer>
            </aside>
        </div>
    );
};

export default FeedPage;
