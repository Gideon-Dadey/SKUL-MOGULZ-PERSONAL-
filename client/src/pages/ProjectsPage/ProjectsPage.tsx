import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import api, { getImageUrl } from '../../services/api';
import './ProjectsPage.css';

const ProjectsPage: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get('search') || '';

    const [filter, setFilter] = useState('all');
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                let url = '/projects?';
                if (urlSearch) url += `search=${encodeURIComponent(urlSearch)}&`;

                const response = await api.get(url);

                let data = response.data.map((p: any) => ({
                    ...p,
                    id: p._id || p.id,
                }));


                if (filter === 'new') {
                    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                } else if (filter === 'trending') {

                    data.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
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
    }, [filter, urlSearch]);

    return (
        <div className="projects-container">
            { }
            <section className="projects-hero">
                <div className="projects-hero__content">
                    <h1>Explore Innovation</h1>
                    <p>Discover the next generation of startups, side-projects, and moonshots.</p>
                </div>
                <div className="projects-hero__stats">
                    <div className="stat-item">
                        <span className="stat-value">120+</span>
                        <span className="stat-label">Live Projects</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">$2M</span>
                        <span className="stat-label">Raised</span>
                    </div>
                </div>
            </section>

            { }
            <div className="sticky-filter-panel">
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="projects-search-input"
                    />
                </div>

                <div className="projects-tabs">
                    <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                    <button className={`tab ${filter === 'funding' ? 'active' : ''}`} onClick={() => setFilter('funding')}>Fundraising</button>
                    <button className={`tab ${filter === 'trending' ? 'active' : ''}`} onClick={() => setFilter('trending')}>Trending</button>
                    <button className={`tab ${filter === 'new' ? 'active' : ''}`} onClick={() => setFilter('new')}>Newest</button>
                </div>

                <button className="filter-btn">
                    <Filter size={18} />
                </button>
            </div>

            { }
            <div className="projects-grid">
                {isLoading ? <div className="loading-state">Initializing Launchpad...</div> : projects.map(post => {
                    const fundingPercent = post.fundingGoal && post.currentFunding
                        ? Math.min((post.currentFunding / post.fundingGoal) * 100, 100)
                        : 0;

                    return (
                        <Link to={`/post/${post.id}`} key={post.id} className="project-card project-card--tech">
                            <div className="project-banner">
                                <div className="project-overlay"></div>
                                <span className={`project-stage-badge stage-${post.projectStage}`}>
                                    {post.projectStage}
                                </span>
                            </div>
                            <div className="project-content">
                                <div className="project-header-row">
                                    <h3 className="project-title">{post.title}</h3>
                                    <div className="project-author-badge">
                                        <img
                                            src={getImageUrl(post.author?.avatar) || `https://ui-avatars.com/api/?name=${post.author?.firstName}&background=A5D6B7&color=fff`}
                                            alt=""
                                        />
                                    </div>
                                </div>

                                <p className="project-desc">{post.content.substring(0, 100)}...</p>

                                <div className="project-tags">
                                    <span className="tag category">{post.category}</span>
                                    {post.tags?.slice(0, 2).map((t: string) => <span key={t} className="tag">#{t}</span>)}
                                </div>

                                {post.fundingGoal && (
                                    <div className="project-funding-snippet">
                                        <div className="funding-progress-tech">
                                            <div className="funding-bar-tech" style={{ width: `${fundingPercent}%` }}></div>
                                        </div>
                                        <div className="funding-numbers">
                                            <span className="highlight">${(post.currentFunding / 1000).toFixed(0)}k</span> / {(post.fundingGoal / 1000).toFixed(0)}k
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
export default ProjectsPage;
