import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    MapPin, Edit2, Plus, MoreHorizontal, Briefcase, GraduationCap, Camera
} from 'lucide-react';
import { useRef } from 'react';
import PostCard from '../../components/PostCard/PostCard';
import { mockUsers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import api, { getImageUrl } from '../../services/api';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuth();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { updateProfile } = useAuth();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setIsLoading(true);

                let user;
                if (username) {
                    user = await authService.getProfile(username);
                } else if (currentUser) {
                    // Fetch fresh data to ensure metrics like connectionCount are accurate
                    user = await authService.getMe();
                }

                if (user) {
                    setProfileUser(user);

                    const userId = user._id || user.id;
                    const response = await api.get(`/projects?author=${userId}`);

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
                    setUserPosts(adaptedPosts);
                }
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [username, currentUser]);

    const handleAvatarClick = () => {
        if (isOwnProfile && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);


            const response = await api.put('/auth/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data) {
                const updatedUser = response.data;

                setProfileUser((prev: any) => ({ ...prev, avatar: updatedUser.avatar }));

                updateProfile(updatedUser);
            }
        } catch (error) {
            console.error("Failed to upload avatar", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeletePost = (postId: string) => {
        setUserPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
    };

    if (isLoading) return <div className="profile-page"><div className="loading-spinner"></div></div>;
    if (!profileUser) return <div className="profile-page">User not found</div>;

    const isOwnProfile = currentUser?.id === (profileUser._id || profileUser.id);

    return (
        <div className="profile-layout">
            { }
            <main className="profile-main">
                { }
                <div className="profile-card profile-hero">
                    <div className="profile-hero__banner" style={{
                        backgroundImage: profileUser.banner ? `url(${getImageUrl(profileUser.banner)})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}></div>
                    <div className="profile-hero__content">
                        <div className="profile-hero__top">
                            <div
                                className={`profile-hero__avatar-container ${isOwnProfile ? 'editable' : ''}`}
                                onClick={handleAvatarClick}
                            >
                                <img
                                    src={getImageUrl(profileUser.avatar) || `https://ui-avatars.com/api/?name=${profileUser.firstName}+${profileUser.lastName}&background=A5D6B7&color=fff&size=200`}
                                    alt={profileUser.firstName}
                                    className="profile-hero__avatar"
                                />
                                {isOwnProfile && (
                                    <div className="profile-hero__avatar-overlay">
                                        {isUploading ? (
                                            <div className="upload-spinner"></div>
                                        ) : (
                                            <Camera size={24} />
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden-input"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
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
                                    {(() => {
                                        const count = Number(profileUser.connectionsCount ?? profileUser.connections?.length ?? 0);
                                        return `${count} connection${count !== 1 ? 's' : ''}`;
                                    })()}
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

                { }
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>About</h2>
                        {isOwnProfile && <button className="profile-section__edit"><Edit2 size={18} /></button>}
                    </div>
                    <div className="profile-section__content">
                        <p>{profileUser.bio ? profileUser.bio : "I am a passionate student entrepreneur looking to connect with like-minded individuals and investors. Currently working on transforming the education landscape through technology."}</p>
                    </div>
                </div>

                { }
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <div className="profile-section__header-left">
                            <h2>Activity</h2>
                            <span className="profile-section__followers">{Math.floor((profileUser.connectionsCount || profileUser.connections?.length || 0) * 2.5 + 42)} followers</span>
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
                                <PostCard key={post.id} post={post} compact={true} onDelete={handleDeletePost} />
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

                { }
                {/* Experiences */}
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
                                <h4>Skul Mogulz • Full-time</h4>
                                <span className="profile-list-item__date">Jan 2024 - Present • 1 mo</span>
                                <span className="profile-list-item__location">San Francisco, California, United States • Hybrid</span>
                                <p>Reimagining how student innovators connect with the mogul ecosystem. Building the future of university-led venture and professional networking.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Education */}
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
                                <h4>Bachelor of Science - BS, Computer Science & Entrepreneurship</h4>
                                <span className="profile-list-item__date">2022 - 2026</span>
                                <p>Activities and societies: Stanford Venture Club, AI Research Lab, Varsity Rowing.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="profile-card profile-section">
                    <div className="profile-section__header">
                        <h2>Skills</h2>
                        {isOwnProfile && (
                            <div className="profile-section__actions">
                                <button className="profile-section__add"><Plus size={24} /></button>
                                <button className="profile-section__edit"><Edit2 size={18} /></button>
                            </div>
                        )}
                    </div>
                    <div className="profile-skills-grid">
                        {(profileUser.interests && profileUser.interests.length > 0) ? (
                            profileUser.interests.slice(0, 3).map((skill: string, index: number) => (
                                <div key={skill} className="skill-item">
                                    <h3>{skill}</h3>
                                    <button className="btn btn-primary btn--xs">
                                        {Math.floor((profileUser.connectionsCount || profileUser.connections?.length || 0) * (0.1 + index * 0.05) + (5 - index))} endorsements
                                    </button>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="skill-item">
                                    <h3>Venture Capital</h3>
                                    <button className="btn btn-primary btn--xs">12 endorsements</button>
                                </div>
                                <div className="skill-item">
                                    <h3>React.js & TypeScript</h3>
                                    <button className="btn btn-primary btn--xs">8 endorsements</button>
                                </div>
                            </>
                        )}
                    </div>
                    {(profileUser.interests?.length > 3) && (
                        <button className="profile-section__footer-link">
                            Show all {profileUser.interests.length} skills <span className="arrow">→</span>
                        </button>
                    )}
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
                        {mockUsers.filter((u: any) => u.id !== (profileUser._id || profileUser.id)).slice(0, 5).map((u: any) => (
                            <div key={u.id} className="sidebar-person">
                                <img
                                    src={getImageUrl(u.avatar) || `https://ui-avatars.com/api/?name=${u.firstName}&background=A5D6B7&color=fff`}
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
