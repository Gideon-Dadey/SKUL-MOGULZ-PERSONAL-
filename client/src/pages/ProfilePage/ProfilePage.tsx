import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, LinkIcon, Calendar, Settings, Grid, List, Heart, Users } from 'lucide-react';
import PostCard from '../../components/PostCard/PostCard';
import { mockPosts, mockUsers } from '../../data/mockData';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    // Using first mock user for demo
    const user = mockUsers[0];
    const userPosts = mockPosts.filter(post => post.author.id === user.id);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="profile-page">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-header__container">
                    <div className="profile-header__main">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=ff6b4a&color=fff&size=128`}
                            alt={user.firstName}
                            className="profile-header__avatar"
                        />
                        <div className="profile-header__info">
                            <h1 className="profile-header__name">
                                {user.firstName} {user.lastName}
                            </h1>
                            <span className="profile-header__username">@{user.username}</span>
                            <span className={`profile-header__role profile-header__role--${user.role}`}>
                                {user.role === 'student' ? '🎓 Student' : '💼 Investor'}
                            </span>
                        </div>
                        <Link to="/settings" className="btn btn-outline profile-header__edit">
                            <Settings size={16} /> Edit Profile
                        </Link>
                    </div>

                    {user.bio && (
                        <p className="profile-header__bio">{user.bio}</p>
                    )}

                    <div className="profile-header__meta">
                        <span className="profile-header__meta-item">
                            <Calendar size={16} />
                            Joined {formatDate(user.createdAt)}
                        </span>
                    </div>

                    <div className="profile-header__stats">
                        <div className="profile-header__stat">
                            <span className="profile-header__stat-value">{userPosts.length}</span>
                            <span className="profile-header__stat-label">Posts</span>
                        </div>
                        <div className="profile-header__stat">
                            <span className="profile-header__stat-value">1.2K</span>
                            <span className="profile-header__stat-label">Followers</span>
                        </div>
                        <div className="profile-header__stat">
                            <span className="profile-header__stat-value">89</span>
                            <span className="profile-header__stat-label">Following</span>
                        </div>
                        <div className="profile-header__stat">
                            <span className="profile-header__stat-value">
                                {userPosts.reduce((acc, post) => acc + post.likes, 0)}
                            </span>
                            <span className="profile-header__stat-label">Likes</span>
                        </div>
                    </div>

                    {user.interests.length > 0 && (
                        <div className="profile-header__interests">
                            <span className="profile-header__interests-label">Interests:</span>
                            {user.interests.map(interest => (
                                <span key={interest} className="profile-header__interest">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Content */}
            <div className="profile-content">
                <div className="profile-content__container">
                    {/* Tabs */}
                    <div className="profile-tabs">
                        <button className="profile-tab active">
                            <Grid size={18} /> Posts
                        </button>
                        <button className="profile-tab">
                            <Heart size={18} /> Liked
                        </button>
                        <button className="profile-tab">
                            <Users size={18} /> Following
                        </button>
                    </div>

                    {/* Posts Grid */}
                    <div className="profile-posts">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="profile-empty">
                                <h3>No posts yet</h3>
                                <p>Share your first project with the community!</p>
                                <Link to="/create-post" className="btn btn-primary">
                                    Create Post
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
