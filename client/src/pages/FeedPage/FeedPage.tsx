import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp, Clock, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '../../components/PostCard/PostCard';
import SearchFilter from '../../components/SearchFilter/SearchFilter';
import { mockPosts } from '../../data/mockData';
import { ProjectCategory } from '../../types';
import './FeedPage.css';

type SortOption = 'trending' | 'recent' | 'popular';

const FeedPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
    const [selectedStage, setSelectedStage] = useState('all');
    const [sortBy, setSortBy] = useState<SortOption>('recent');

    const filteredPosts = useMemo(() => {
        let posts = [...mockPosts];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            posts = posts.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query)) ||
                post.author.firstName.toLowerCase().includes(query) ||
                post.author.lastName.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            posts = posts.filter(post => post.category === selectedCategory);
        }

        // Stage filter
        if (selectedStage !== 'all') {
            posts = posts.filter(post => post.projectStage === selectedStage);
        }

        // Sorting
        switch (sortBy) {
            case 'trending':
                posts.sort((a, b) => (b.likes + b.comments.length * 2) - (a.likes + a.comments.length * 2));
                break;
            case 'popular':
                posts.sort((a, b) => b.likes - a.likes);
                break;
            case 'recent':
            default:
                posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        return posts;
    }, [searchQuery, selectedCategory, selectedStage, sortBy]);

    const handleLike = (postId: string) => {
        console.log('Liked post:', postId);
        // TODO: Implement like functionality
    };

    return (
        <div className="feed-page">
            <div className="feed-page__container">
                {/* Left Sidebar */}
                <aside className="feed-page__sidebar feed-page__sidebar--left">
                    <div className="sidebar-card">
                        <h3 className="sidebar-card__title">Quick Actions</h3>
                        <Link to="/create-post" className="btn btn-primary" style={{ width: '100%' }}>
                            <Plus size={18} /> Create Post
                        </Link>
                    </div>

                    <div className="sidebar-card">
                        <h3 className="sidebar-card__title">Trending Topics</h3>
                        <div className="trending-topics">
                            <a href="#" className="trending-topic">#EdTech</a>
                            <a href="#" className="trending-topic">#AIStartups</a>
                            <a href="#" className="trending-topic">#GenZFounders</a>
                            <a href="#" className="trending-topic">#HealthTech</a>
                            <a href="#" className="trending-topic">#SeedFunding</a>
                        </div>
                    </div>
                </aside>

                {/* Main Feed */}
                <main className="feed-page__main">
                    <div className="feed-page__header">
                        <h1 className="feed-page__title">Discover Projects</h1>
                        <div className="feed-page__sort">
                            <button
                                className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
                                onClick={() => setSortBy('recent')}
                            >
                                <Clock size={16} /> Recent
                            </button>
                            <button
                                className={`sort-btn ${sortBy === 'trending' ? 'active' : ''}`}
                                onClick={() => setSortBy('trending')}
                            >
                                <TrendingUp size={16} /> Trending
                            </button>
                            <button
                                className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
                                onClick={() => setSortBy('popular')}
                            >
                                <Flame size={16} /> Popular
                            </button>
                        </div>
                    </div>

                    <SearchFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedStage={selectedStage}
                        onStageChange={setSelectedStage}
                    />

                    <div className="feed-page__posts">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onLike={handleLike}
                                />
                            ))
                        ) : (
                            <div className="feed-page__empty">
                                <h3>No projects found</h3>
                                <p>Try adjusting your filters or search query</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="feed-page__sidebar feed-page__sidebar--right">
                    <div className="sidebar-card">
                        <h3 className="sidebar-card__title">Top Investors</h3>
                        <div className="top-users">
                            <div className="top-user">
                                <img
                                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop"
                                    alt="Sarah Williams"
                                    className="top-user__avatar"
                                />
                                <div className="top-user__info">
                                    <span className="top-user__name">Sarah Williams</span>
                                    <span className="top-user__role">Angel Investor</span>
                                </div>
                            </div>
                            <div className="top-user">
                                <img
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop"
                                    alt="Michael Chen"
                                    className="top-user__avatar"
                                />
                                <div className="top-user__info">
                                    <span className="top-user__name">Michael Chen</span>
                                    <span className="top-user__role">VC Partner</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-card">
                        <h3 className="sidebar-card__title">Platform Stats</h3>
                        <div className="platform-stats">
                            <div className="platform-stat">
                                <span className="platform-stat__value">2.5K+</span>
                                <span className="platform-stat__label">Active Projects</span>
                            </div>
                            <div className="platform-stat">
                                <span className="platform-stat__value">$8.2M</span>
                                <span className="platform-stat__label">Funded This Month</span>
                            </div>
                            <div className="platform-stat">
                                <span className="platform-stat__value">450+</span>
                                <span className="platform-stat__label">New Signups Today</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default FeedPage;
