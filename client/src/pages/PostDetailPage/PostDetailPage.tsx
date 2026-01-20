import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Send, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { mockPosts, mockUsers } from '../../data/mockData';
import './PostDetailPage.css';

const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(false);

    const post = mockPosts.find(p => p.id === id);

    if (!post) {
        return (
            <div className="post-detail-layout">
                <div className="post-not-found">
                    <h2>Post not found</h2>
                    <Link to="/feed" className="btn btn-primary">Back to Feed</Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStageColor = (stage: typeof post.projectStage) => {
        const colors: Record<string, string> = {
            idea: '#8b5cf6',
            prototype: '#3b82f6',
            mvp: '#10b981',
            growth: '#f59e0b',
            scaling: '#ef4444',
        };
        return colors[stage] || colors.idea;
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
        <div className="post-detail-layout">
            <main className="post-detail-main">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back
                </button>

                <article className="post-article card">
                    {/* Header */}
                    <div className="post-article__header">
                        <div className="post-article__author-row">
                            <Link to={`/profile/${post.author.username}`} className="post-article__avatar-link">
                                <img
                                    src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=ff6b4a&color=fff`}
                                    alt={post.author.firstName}
                                    className="post-article__avatar"
                                />
                            </Link>
                            <div className="post-article__meta">
                                <Link to={`/profile/${post.author.username}`} className="post-article__name">
                                    {post.author.firstName} {post.author.lastName}
                                </Link>
                                <span className="post-article__headline">Student Entrepreneur</span>
                                <span className="post-article__date">{formatDate(post.createdAt)} • <GlobeIcon /></span>
                            </div>
                            <button className="post-article__more">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="post-article__content">
                        <div className="post-article__badges">
                            <span
                                className="stage-badge"
                                style={{
                                    backgroundColor: `${getStageColor(post.projectStage)}20`,
                                    color: getStageColor(post.projectStage)
                                }}
                            >
                                {post.projectStage.toUpperCase()}
                            </span>
                            <span className="category-badge">{post.category}</span>
                        </div>

                        <h1 className="post-article__title">{post.title}</h1>

                        <div className="post-article__text">
                            {post.content.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        {/* Funding Card */}
                        {fundingProgress !== null && (
                            <div className="funding-widget">
                                <div className="funding-widget__header">
                                    <div className="funding-widget__info">
                                        <span className="funding-widget__amount">${post.currentFunding?.toLocaleString()}</span>
                                        <span className="funding-widget__goal">raised of ${post.fundingGoal?.toLocaleString()} goal</span>
                                    </div>
                                    <span className="funding-widget__percent">{fundingProgress.toFixed(0)}%</span>
                                </div>
                                <div className="funding-widget__bar">
                                    <div className="funding-widget__fill" style={{ width: `${fundingProgress}%` }}></div>
                                </div>
                                <button className="btn btn-primary btn--full">Support Project</button>
                            </div>
                        )}

                        <div className="post-article__tags">
                            {post.tags.map(tag => (
                                <span key={tag} className="hashtag">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="post-article__stats">
                        <div className="stats-left">
                            <span className="stats-icon-group">
                                <ThumbsUp size={14} fill="var(--primary)" color="var(--primary)" />
                                <Heart size={14} fill="#ef4444" color="#ef4444" />
                            </span>
                            <span className="stats-text">{post.likes} likes</span>
                        </div>
                        <div className="stats-right">
                            <span className="stats-text">{post.comments.length} comments • 42 shares</span>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="post-article__actions">
                        <button
                            className={`action-btn ${isLiked ? 'active' : ''}`}
                            onClick={() => setIsLiked(!isLiked)}
                        >
                            <ThumbsUp size={20} />
                            <span>Like</span>
                        </button>
                        <button className="action-btn">
                            <MessageCircle size={20} />
                            <span>Comment</span>
                        </button>
                        <button className="action-btn">
                            <Share2 size={20} />
                            <span>Share</span>
                        </button>
                        <button className="action-btn">
                            <Send size={20} />
                            <span>Send</span>
                        </button>
                    </div>

                    {/* Comments Section */}
                    <div className="post-article__comments">
                        <div className="comment-input-area">
                            <img
                                src={`https://ui-avatars.com/api/?name=You&background=ff6b4a&color=fff`}
                                alt="Your avatar"
                                className="comment-avatar"
                            />
                            <form className="comment-form-new" onSubmit={handleSubmitComment}>
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="comment-input"
                                />
                                {commentText && (
                                    <button type="submit" className="btn btn-primary btn--sm">Post</button>
                                )}
                            </form>
                        </div>

                        <div className="comments-list">
                            {post.comments.map(comment => (
                                <div key={comment.id} className="comment-item">
                                    <img
                                        src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.firstName}&background=ff6b4a&color=fff`}
                                        alt={comment.author.firstName}
                                        className="comment-item__avatar"
                                    />
                                    <div className="comment-item__box">
                                        <div className="comment-item__header">
                                            <div className="comment-item__info">
                                                <span className="comment-item__name">{comment.author.firstName} {comment.author.lastName}</span>
                                                <span className="comment-item__headline">Student • {formatDate(comment.createdAt)}</span>
                                            </div>
                                        </div>
                                        <p className="comment-item__text">{comment.content}</p>
                                    </div>
                                    <div className="comment-item__actions">
                                        <button>Like</button>
                                        <button>Reply</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>
            </main>

            <aside className="post-detail-sidebar">
                <div className="card sidebar-card">
                    <div className="sidebar-card__header">
                        <h3>About the Author</h3>
                    </div>
                    <div className="sidebar-author">
                        <img
                            src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=ff6b4a&color=fff`}
                            alt={post.author.firstName}
                            className="sidebar-author__avatar"
                        />
                        <div className="sidebar-author__info">
                            <h4>{post.author.firstName} {post.author.lastName}</h4>
                            <p>Student Entrepreneur | Building the next big thing in EdTech</p>
                            <button className="btn btn-outline btn--sm btn--full">Connect</button>
                        </div>
                    </div>
                </div>

                <div className="card sidebar-card">
                    <div className="sidebar-card__header">
                        <h3>More from {post.author.firstName}</h3>
                    </div>
                    <div className="sidebar-more-list">
                        {/* Placeholder for more posts */}
                        <p className="text-muted text-sm">No other posts yet.</p>
                    </div>
                </div>
            </aside>
        </div>
    );
};

const GlobeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        data-supported-dps="16x16"
        fill="currentColor"
        width="12"
        height="12"
        focusable="false"
        style={{ marginLeft: 4, verticalAlign: 'text-bottom' }}
    >
        <path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM2.2 8a5.8 5.8 0 011.8-3.92C5.3 5.3 6.6 6 8 6s2.7-.7 4-1.92A5.8 5.8 0 0113.8 8c-1.3 1.2-2.6 1.92-4 1.92S5.3 9.2 4 8c-1.3-1.2-2.6-1.92-4-1.92z"></path>
    </svg>
);

export default PostDetailPage;
