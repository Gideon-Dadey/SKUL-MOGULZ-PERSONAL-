import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Users, Eye,
    ChevronUp, ArrowRight, Award, Heart
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';
import './AnalyticsPage.css';

const AnalyticsPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const result = await analyticsService.getAnalytics();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="analytics-loading">Loading your insights...</div>;
    if (!data) return <div className="analytics-error">Could not load analytics.</div>;

    return (
        <div className="analytics-container">
            <header className="analytics-header">
                <div className="header-content">
                    <h1>Analytics Dashboard</h1>
                    <p>Track your project reach and community engagement</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline">Export Data</button>
                    <button className="btn btn-primary">Try Premium</button>
                </div>
            </header>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon views"><Eye size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Project Views</span>
                        <h2 className="stat-value">{data.summary.totalViews.toLocaleString()}</h2>
                        <span className="stat-trend positive"><ChevronUp size={14} /> 12%</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon profile"><Users size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Profile Visits</span>
                        <h2 className="stat-value">{data.summary.profileViews.toLocaleString()}</h2>
                        <span className="stat-trend positive"><ChevronUp size={14} /> 8%</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon interactions"><Heart size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Engagements</span>
                        <h2 className="stat-value">{(data.summary.totalLikes + data.summary.totalComments).toLocaleString()}</h2>
                        <span className="stat-trend positive"><ChevronUp size={14} /> 24%</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon search"><TrendingUp size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Search appearances</span>
                        <h2 className="stat-value">{data.summary.searchAppearances.toLocaleString()}</h2>
                        <span className="stat-trend neutral">0%</span>
                    </div>
                </div>
            </div>

            <div className="analytics-content-grid">
                {/* Main Graph Placeholder */}
                <div className="analytics-card main-graph">
                    <div className="card-header">
                        <h3>Content performance</h3>
                        <select className="period-select">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                        </select>
                    </div>
                    <div className="graph-container">
                        <div className="graph-placeholder">
                            {/* Simple Visual Bars */}
                            {data.graphs.views.map((val: number, i: number) => (
                                <div key={i} className="graph-bar-wrapper">
                                    <div
                                        className="graph-bar"
                                        style={{ height: `${(val / 1000) * 100}%` }}
                                        title={`${data.graphs.labels[i]}: ${val} views`}
                                    ></div>
                                    <span className="bar-label">{data.graphs.labels[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Projects */}
                <div className="analytics-card top-projects">
                    <div className="card-header">
                        <h3>Top Performing Projects</h3>
                        <button className="btn-text">View all</button>
                    </div>
                    <div className="project-rank-list">
                        {data.topProjects.length === 0 ? (
                            <p className="empty-projects">No projects found. Start sharing your ideas!</p>
                        ) : data.topProjects.map((project: any, index: number) => (
                            <div key={project.id} className="project-rank-item">
                                <span className="rank-number">{index + 1}</span>
                                <div className="project-rank-info">
                                    <h4>{project.title}</h4>
                                    <div className="project-rank-stats">
                                        <span><Eye size={12} /> {project.views}</span>
                                        <span><Heart size={12} /> {project.likes}</span>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="item-arrow" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tips Section */}
            <div className="analytics-card tips-card">
                <div className="tips-content">
                    <div className="tips-icon"><Award size={32} /></div>
                    <div className="tips-text">
                        <h3>Boost your visibility</h3>
                        <p>Projects with 3+ images get 2.5x more engagement. Try adding more media to your latest post!</p>
                    </div>
                    <button className="btn btn-outline">Check Tips</button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
