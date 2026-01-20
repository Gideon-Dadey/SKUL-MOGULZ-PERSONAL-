import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    MapPin, Calendar, Settings, Grid, Heart, Users,
    Edit2, Plus, Share2, MoreHorizontal, Briefcase, GraduationCap
} from 'lucide-react';
import PostCard from '../../components/PostCard/PostCard';
import { mockPosts, mockUsers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuth();

    // Find user based on URL param or fallback to current (or mock) user
    const profileUser = username
        ? mockUsers.find(u => u.username === username)
        : currentUser ? currentUser : mockUsers[0];

    const userPosts = mockPosts.filter(post => post.author.id === profileUser?.id);

    if (!profileUser) return <div className="profile-page">User not found</div>;

    const isOwnProfile = currentUser?.id === profileUser.id;

    return (
        <div className="profile-layout">
            {/* Main Column */}
            <main className="profile-main">
                {/* Profile Header Card */}
                <div className="profile-card profile-hero">
                    <div className="profile-hero__banner"></div>
                    <div className="profile-hero__content">
                        <div className="profile-hero__top">
                            <img
                                src={profileUser.avatar || `https://ui-avatars.com/api/?name=${profileUser.firstName}+${profileUser.lastName}&background=ff6b4a&color=fff&size=128`}
                                alt={profileUser.firstName}
                                className="profile-hero__avatar"
                            />
                            {isOwnProfile && (
                                <button className="profile-hero__edit-btn" aria-label="Edit Profile">
                                    <Edit2 size={18} />
                                </button>
                            )}
                        </div>

                        <div className="profile-hero__info">
                            <div className="profile-hero__text">
                                <h1 className="profile-hero__name">
                                    {profileUser.firstName} {profileUser.lastName}
                                </h1>
                                <p className="profile-hero__headline">
                                    {profileUser.bio || "Student Entrepreneur | Building the next big thing in EdTech"}
                                </p>
                                <div className="profile-hero__location">
                                    <MapPin size={16} />
                                    <span>San Francisco Bay Area</span> • <Link to="/contact-info">Contact info</Link>
                                </div>
                                <Link to="/connections" className="profile-hero__connections">
                                    500+ connections
                                </Link>
                            </div>

                            <div className="profile-hero__actions">
                                {isOwnProfile ? (
                                    <>
                                        <button className="btn btn-primary btn--md">Open to</button>
                                        <button className="btn btn-outline btn--md">Add profile section</button>
                                        <button className="btn btn-outline btn--icon"><MoreHorizontal size={20} /></button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-primary btn--md">Connect</button>
                                        <button className="btn btn-outline btn--md">Message</button>
                                        <button className="btn btn-outline btn--md">More</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>About</h2>
                        {isOwnProfile && <button className="profile-section__edit"><Edit2 size={18} /></button>}
                    </div>
                    <div className="profile-section__content">
                        <p>{profileUser.bio ? profileUser.bio : "I am a passionate student entrepreneur looking to connect with like-minded individuals and investors. Currently working on transforming the education landscape through technology."}</p>
                    </div>
                </div>

                {/* Activity Section */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <div className="profile-section__header-left">
                            <h2>Activity</h2>
                            <span className="profile-section__followers">1,234 followers</span>
                        </div>
                        <div className="profile-section__header-actions">
                            {isOwnProfile ? (
                                <button className="btn btn-outline btn--sm">Create a post</button>
                            ) : (
                                <button className="btn btn-outline btn--sm">Follow</button>
                            )}
                            {isOwnProfile && <button className="profile-section__edit"><Edit2 size={18} /></button>}
                        </div>
                    </div>

                    <div className="profile-tabs">
                        <button className="profile-tab active">Posts</button>
                        <button className="profile-tab">Comments</button>
                        <button className="profile-tab">Images</button>
                    </div>

                    <div className="profile-activity-list">
                        {userPosts.length > 0 ? (
                            userPosts.slice(0, 3).map(post => (
                                <PostCard key={post.id} post={post} compact={true} />
                            ))
                        ) : (
                            <div className="profile-empty">
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>

                    <button className="profile-section__footer-link">
                        Show all activity <span className="arrow">→</span>
                    </button>
                </div>

                {/* Experience Placeholder */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>Experience</h2>
                        {isOwnProfile && (
                            <div className="profile-section__actions">
                                <button className="profile-section__add"><Plus size={24} /></button>
                                <button className="profile-section__edit"><Edit2 size={18} /></button>
                            </div>
                        )}
                    </div>
                    <div className="profile-list">
                        <div className="profile-list-item">
                            <div className="profile-list-item__icon">
                                <Briefcase size={24} />
                            </div>
                            <div className="profile-list-item__content">
                                <h3>Founder & CEO</h3>
                                <h4>{profileUser.firstName}'s Startup</h4>
                                <span className="profile-list-item__date">Jan 2024 - Present • 1 mo</span>
                                <span className="profile-list-item__location">San Francisco, CA</span>
                                <p>Building the future of EdTech.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Education Placeholder */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>Education</h2>
                        {isOwnProfile && (
                            <div className="profile-section__actions">
                                <button className="profile-section__add"><Plus size={24} /></button>
                                <button className="profile-section__edit"><Edit2 size={18} /></button>
                            </div>
                        )}
                    </div>
                    <div className="profile-list">
                        <div className="profile-list-item">
                            <div className="profile-list-item__icon">
                                <GraduationCap size={24} />
                            </div>
                            <div className="profile-list-item__content">
                                <h3>Stanford University</h3>
                                <h4>Bachelor of Science - BS, Computer Science</h4>
                                <span className="profile-list-item__date">2022 - 2026</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills & Interests */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>Skills & Interests</h2>
                        {isOwnProfile && (
                            <div className="profile-section__actions">
                                <button className="profile-section__add"><Plus size={24} /></button>
                                <button className="profile-section__edit"><Edit2 size={18} /></button>
                            </div>
                        )}
                    </div>
                    <div className="profile-skills">
                        {profileUser.interests.map(interest => (
                            <span key={interest} className="profile-skill">
                                {interest}
                            </span>
                        ))}
                        <span className="profile-skill">Public Speaking</span>
                        <span className="profile-skill">Project Management</span>
                        <span className="profile-skill">React.js</span>
                    </div>
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="profile-sidebar">
                <div className="profile-card sidebar-card">
                    <div className="sidebar-card__header">
                        <h3>Profile language</h3>
                        <button className="sidebar-card__icon-btn"><Edit2 size={16} /></button>
                    </div>
                    <div className="sidebar-card__content">
                        <p className="text-muted">English</p>
                    </div>
                    <div className="sidebar-card__divider"></div>
                    <div className="sidebar-card__header">
                        <h3>Public profile & URL</h3>
                        <button className="sidebar-card__icon-btn"><Edit2 size={16} /></button>
                    </div>
                    <div className="sidebar-card__content">
                        <p className="text-muted text-sm">www.skulmogulz.com/in/{profileUser.username}</p>
                    </div>
                </div>

                <div className="profile-card sidebar-card">
                    <div className="sidebar-card__header">
                        <h3>People also viewed</h3>
                    </div>
                    <div className="sidebar-people-list">
                        {mockUsers.filter(u => u.id !== profileUser.id).slice(0, 5).map(u => (
                            <div key={u.id} className="sidebar-person">
                                <img
                                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.firstName}&background=ff6b4a&color=fff`}
                                    className="sidebar-person__avatar"
                                    alt=""
                                />
                                <div className="sidebar-person__info">
                                    <Link to={`/profile/${u.username}`} className="sidebar-person__name">
                                        {u.firstName} {u.lastName}
                                    </Link>
                                    <p className="sidebar-person__headline">{u.role === 'student' ? 'Student Founder' : 'Angel Investor'}</p>
                                    <button className="btn btn-outline btn--xs">Connect</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default ProfilePage;
