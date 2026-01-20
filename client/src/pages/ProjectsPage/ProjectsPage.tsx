import React, { useState } from 'react';
import { Search, Filter, Briefcase, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockPosts } from '../../data/mockData';
import './ProjectsPage.css';

const ProjectsPage: React.FC = () => {
    const [filter, setFilter] = useState('all');

    return (
        <div className="projects-container">
            <div className="projects-layout">
                {/* Header Section */}
                <header className="projects-header-card">
                    <h2>Discover Projects</h2>
                    <div className="projects-controls">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, tag, or technology..."
                                className="projects-search-input"
                            />
                        </div>
                        <button className="filter-btn">
                            <Filter size={18} /> Filters
                        </button>
                    </div>
                    <div className="projects-tabs">
                        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Projects</button>
                        <button className={`tab ${filter === 'funding' ? 'active' : ''}`} onClick={() => setFilter('funding')}>Fundraising</button>
                        <button className={`tab ${filter === 'trending' ? 'active' : ''}`} onClick={() => setFilter('trending')}>Trending</button>
                        <button className={`tab ${filter === 'new' ? 'active' : ''}`} onClick={() => setFilter('new')}>Newest</button>
                    </div>
                </header>

                {/* Grid */}
                <div className="projects-grid">
                    {mockPosts.map(post => {
                        const fundingPercent = post.fundingGoal && post.currentFunding
                            ? Math.min((post.currentFunding / post.fundingGoal) * 100, 100)
                            : 0;

                        return (
                            <Link to={`/post/${post.id}`} key={post.id} className="project-card">
                                <div className="project-banner">
                                    <div className="project-stage-badge">{post.projectStage}</div>
                                </div>
                                <div className="project-content">
                                    <h3 className="project-title">{post.title}</h3>
                                    <div className="project-author">
                                        <img src={post.author.avatar} alt={post.author.firstName} className="author-avatar-sm" />
                                        <span className="author-name">{post.author.firstName} {post.author.lastName}</span>
                                        <span className="post-date">• 2d ago</span>
                                    </div>
                                    <p className="project-desc">{post.content.substring(0, 120)}...</p>

                                    <div className="project-tags">
                                        <span className="tag category">{post.category}</span>
                                        {post.tags.slice(0, 2).map(t => <span key={t} className="tag">#{t}</span>)}
                                    </div>

                                    {post.fundingGoal && (
                                        <div className="project-funding-snippet">
                                            <div className="funding-progress-sm">
                                                <div className="funding-bar-sm" style={{ width: `${fundingPercent}%` }}></div>
                                            </div>
                                            <div className="funding-numbers">
                                                <span className="highlight">${post.currentFunding?.toLocaleString()}</span> raised
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;
