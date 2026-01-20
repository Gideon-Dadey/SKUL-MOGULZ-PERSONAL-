import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Send, MoreHorizontal } from 'lucide-react';
import { mockPosts } from '../../data/mockData';
import './PostDetailPage.css';

const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(false);

    const post = mockPosts.find(p => p.id === id);

    if (!post) {
        return (
            <div className="post-detail-page">
                <div className="post-detail-page__container">
                    <div className="post-detail-page__not-found">
                        <h2>Post not found</h2>
                        <Link to="/feed" className="btn btn-primary">Back to Feed</Link>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStageColor = (stage: typeof post.projectStage) => {
        const colors = {
            idea: '#8b5cf6',
            prototype: '#3b82f6',
            mvp: '#10b981',
            growth: '#f59e0b',
            scaling: '#ef4444',
        };
        return colors[stage];
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            console.log('Submitting comment:', commentText);
            setCommentText('');
        }
    };

    const fundingProgress = post.fundingGoal && post.currentFunding
        ? Math.min((post.currentFunding / post.fundingGoal) * 100, 100)
        : null;

    return (
        <div className="post-detail-page">
            <div className="post-detail-page__container">
                {/* Back Button */}
                <button className="post-detail-page__back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back
                </button>

                {/* Main Post */}
                <article className="post-detail">
                    <header className="post-detail__header">
                        <Link to={`/profile/${post.author.username}`} className="post-detail__author">
                            <img
                                src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=ff6b4a&color=fff`}
                                alt={post.author.firstName}
                                className="post-detail__avatar"
                            />
                            <div className="post-detail__author-info">
                                <span className="post-detail__author-name">
                                    {post.author.firstName} {post.author.lastName}
                                </span>
                                <span className="post-detail__author-username">
                                    @{post.author.username}
                                </span>
                            </div>
                        </Link>
                        <div className="post-detail__meta">
                            <span
                                className="post-detail__stage"
                                style={{ backgroundColor: `${getStageColor(post.projectStage)}20`, color: getStageColor(post.projectStage) }}
                            >
                                {post.projectStage.charAt(0).toUpperCase() + post.projectStage.slice(1)}
                            </span>
                            <span className="post-detail__date">{formatDate(post.createdAt)}</span>
                        </div>
                    </header>

                    <h1 className="post-detail__title">{post.title}</h1>

                    <div className="post-detail__content">
                        {post.content.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    {/* Funding Card */}
                    {fundingProgress !== null && (
                        <div className="post-detail__funding">
                            <div className="post-detail__funding-header">
                                <div>
                                    <span className="post-detail__funding-raised">
                                        ${post.currentFunding!.toLocaleString()}
                                    </span>
                                    <span className="post-detail__funding-goal">
                                        raised of ${post.fundingGoal!.toLocaleString()} goal
                                    </span>
                                </div>
                                <span className="post-detail__funding-percent">
                                    {fundingProgress.toFixed(0)}%
                                </span>
                            </div>
                            <div className="post-detail__funding-bar">
                                <div
                                    className="post-detail__funding-progress"
                                    style={{ width: `${fundingProgress}%` }}
                                />
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                Express Interest
                            </button>
                        </div>
                    )}

                    {/* Tags */}
                    <div className="post-detail__tags">
                        <span className="post-detail__category">{post.category}</span>
                        {post.tags.map(tag => (
                            <span key={tag} className="post-detail__tag">#{tag}</span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="post-detail__actions">
                        <button
                            className={`post-detail__action-btn ${isLiked ? 'liked' : ''}`}
                            onClick={() => setIsLiked(!isLiked)}
                        >
                            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                            <span>{post.likes + (isLiked ? 1 : 0)}</span>
                        </button>
                        <button className="post-detail__action-btn">
                            <MessageCircle size={20} />
                            <span>{post.comments.length}</span>
                        </button>
                        <button className="post-detail__action-btn">
                            <Share2 size={20} />
                            <span>Share</span>
                        </button>
                        <button className="post-detail__action-btn">
                            <Bookmark size={20} />
                            <span>Save</span>
                        </button>
                    </div>
                </article>

                {/* Comments Section */}
                <section className="comments-section">
                    <h2 className="comments-section__title">
                        Comments ({post.comments.length})
                    </h2>

                    {/* Comment Form */}
                    <form className="comment-form" onSubmit={handleSubmitComment}>
                        <img
                            src="https://ui-avatars.com/api/?name=You&background=ff6b4a&color=fff"
                            alt="Your avatar"
                            className="comment-form__avatar"
                        />
                        <div className="comment-form__input-wrapper">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                rows={2}
                                className="comment-form__input"
                            />
                            <button
                                type="submit"
                                className="comment-form__submit"
                                disabled={!commentText.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="comments-list">
                        {post.comments.length > 0 ? (
                            post.comments.map(comment => (
                                <div key={comment.id} className="comment">
                                    <Link to={`/profile/${comment.author.username}`}>
                                        <img
                                            src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.firstName}&background=ff6b4a&color=fff`}
                                            alt={comment.author.firstName}
                                            className="comment__avatar"
                                        />
                                    </Link>
                                    <div className="comment__content">
                                        <div className="comment__header">
                                            <Link to={`/profile/${comment.author.username}`} className="comment__author">
                                                {comment.author.firstName} {comment.author.lastName}
                                            </Link>
                                            <span className="comment__date">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p className="comment__text">{comment.content}</p>
                                        <div className="comment__actions">
                                            <button className="comment__action">
                                                <Heart size={14} /> {comment.likes}
                                            </button>
                                            <button className="comment__action">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="comments-empty">
                                <p>No comments yet. Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PostDetailPage;
