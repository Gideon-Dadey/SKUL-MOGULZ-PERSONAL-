import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import './PostCard.css';

interface PostCardProps {
    post: any;
    onLike?: (postId: string) => void;
    compact?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, compact = false }) => {
    const { user } = useAuth();

    // Check if liked by current user
    const isLiked = user && (post.likedBy || []).includes(user.id);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getStageColor = (stage: Post['projectStage']) => {
        const colors = {
            idea: '#8b5cf6',
            prototype: '#3b82f6',
            mvp: '#10b981',
            growth: '#f59e0b',
            scaling: '#ef4444',
        };
        return colors[stage];
    };

    const getFundingProgress = () => {
        if (!post.fundingGoal || !post.currentFunding) return null;
        return Math.min((post.currentFunding / post.fundingGoal) * 100, 100);
    };

    const fundingProgress = getFundingProgress();

    return (
        <article className={`post-card ${compact ? 'post-card--compact' : ''}`}>
            <div className="post-card__header">
                <Link to={`/profile/${post.author.username}`} className="post-card__author">
                    <img
                        src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=ff6b4a&color=fff`}
                        alt={post.author.firstName}
                        className="post-card__avatar"
                    />
                    <div className="post-card__author-info">
                        <span className="post-card__author-name">
                            {post.author.firstName} {post.author.lastName}
                        </span>
                        <span className="post-card__meta">
                            @{post.author.username} · {formatDate(post.createdAt)}
                        </span>
                    </div>
                </Link>
                <div className="post-card__actions-top">
                    <span
                        className="post-card__stage"
                        style={{ backgroundColor: `${getStageColor(post.projectStage)}20`, color: getStageColor(post.projectStage) }}
                    >
                        {post.projectStage.charAt(0).toUpperCase() + post.projectStage.slice(1)}
                    </span>
                    <button className="post-card__more-btn">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            <Link to={`/post/${post.id}`} className="post-card__content-link">
                <div className="post-card__content">
                    <h3 className="post-card__title">{post.title}</h3>
                    <p className="post-card__text">
                        {compact ? post.content.slice(0, 200) + '...' : post.content.slice(0, 400) + (post.content.length > 400 ? '...' : '')}
                    </p>
                </div>
                {post.media && post.media.length > 0 && (
                    <div className="post-card__media">
                        {post.media.slice(0, 3).map((url: string, idx: number) => (
                            <div key={idx} className="post-card__image-wrapper">
                                <img src={url} alt="" className="post-card__image" />
                                {idx === 2 && post.media.length > 3 && (
                                    <div className="post-card__media-overlay">+{post.media.length - 3}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Link>

            {fundingProgress !== null && (
                <div className="post-card__funding">
                    <div className="post-card__funding-header">
                        <span className="post-card__funding-raised">
                            ${(post.currentFunding! / 1000).toFixed(0)}K raised
                        </span>
                        <span className="post-card__funding-goal">
                            of ${(post.fundingGoal! / 1000).toFixed(0)}K goal
                        </span>
                    </div>
                    <div className="post-card__funding-bar">
                        <div
                            className="post-card__funding-progress"
                            style={{ width: `${fundingProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="post-card__tags">
                <span className="post-card__category">{post.category}</span>
                {post.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="post-card__tag">#{tag}</span>
                ))}
            </div>

            <div className="post-card__footer">
                <button
                    className={`post-card__action-btn ${isLiked ? 'active' : ''}`}
                    onClick={() => onLike?.(post.id)}
                >
                    <Heart size={18} fill={isLiked ? "var(--primary)" : "none"} color={isLiked ? "var(--primary)" : "currentColor"} />
                    <span>{post.likes}</span>
                </button>
                <Link to={`/post/${post.id}`} className="post-card__action-btn">
                    <MessageCircle size={18} />
                    <span>{post.comments.length}</span>
                </Link>
                <button className="post-card__action-btn">
                    <Share2 size={18} />
                </button>
                <button className="post-card__action-btn">
                    <Bookmark size={18} />
                </button>
            </div>
        </article>
    );
};

export default PostCard;
