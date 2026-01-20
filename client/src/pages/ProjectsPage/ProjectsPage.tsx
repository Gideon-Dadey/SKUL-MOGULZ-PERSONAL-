import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './ProjectsPage.css';

const ProjectsPage: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                // In a real app, we would pass 'filter' to the API query params
                // For now, we fetch all and sort/filter client-side or assume default
                const response = await api.get('/projects');

                let data = response.data.map((p: any) => ({
                    ...p,
                    id: p._id || p.id,
                }));

                // Simple Client-side filtering/sorting logic
                if (filter === 'new') {
                    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                } else if (filter === 'trending') {
                    // Sort by likes count
                    data.sort((a: any, b: any) => (b.likes?.length || 0) - (a.likes?.length || 0));
                } else if (filter === 'funding') {
                    data = data.filter((p: any) => p.fundingGoal && p.fundingGoal > 0);
                }

                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [filter]);

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
                    {isLoading ? <div style={{ padding: 20 }}>Loading...</div> : projects.map(post => {
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
                                        <img
                                            src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.firstName || 'U'}&background=ff6b4a&color=fff`}
                                            alt={post.author?.firstName}
                                            className="author-avatar-sm"
                                        />
                                        <span className="author-name">{post.author?.firstName} {post.author?.lastName}</span>
                                        <span className="post-date">• {new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="project-desc">{post.content.substring(0, 120)}...</p>

                                    <div className="project-tags">
                                        <span className="tag category">{post.category}</span>
                                        {post.tags?.slice(0, 2).map((t: string) => <span key={t} className="tag">#{t}</span>)}
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
