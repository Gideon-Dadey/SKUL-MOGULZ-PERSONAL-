import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Send, MoreHorizontal, ThumbsUp, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './PostDetailPage.css';

const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/projects/${id}`);
                const p = response.data;
                const adaptedPost = {
                    ...p,
                    id: p._id || p.id,
                    likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
                    likedBy: Array.isArray(p.likes) ? p.likes : [],
                    comments: (p.comments || []).map((c: any) => ({
                        ...c,
                        id: c._id || c.id,
                        author: { ...c.author, id: c.author?._id || c.author?.id },
                        replies: (c.replies || []).map((r: any) => ({
                            ...r,
                            id: r._id || r.id,
                            author: { ...r.author, id: r.author?._id || r.author?.id }
                        }))
                    })),
                    author: {
                        ...p.author,
                        id: p.author?._id || p.author?.id
                    }
                };
                setPost(adaptedPost);


                if (user && adaptedPost.likedBy.includes(user.id)) {
                    setIsLiked(true);
                }
            } catch (error) {
                console.error("Failed to fetch post", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPost();
    }, [id, user]);

    const handleLike = async () => {
        if (!post) return;
        try {
            const response = await api.put(`/projects/${post.id}/like`);
            const updatedLikes = response.data;

            setPost((prev: any) => ({
                ...prev,
                likes: updatedLikes.length,
                likedBy: updatedLikes
            }));

            setIsLiked(!isLiked);
            if (user) {
                setIsLiked(updatedLikes.includes(user.id));
            }
        } catch (error) {
            console.error("Failed to like post", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            setIsDeleting(true);
            await api.delete(`/projects/${post.id}`);
            navigate('/feed');
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post");
        } finally {
            setIsDeleting(false);
            setShowMenu(false);
        }
    };

    const handleEdit = () => {
        navigate('/create-post', { state: { post } });
        setShowMenu(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStageColor = (stage: string) => {
        const colors: Record<string, string> = {
            idea: '#8b5cf6',
            prototype: '#3b82f6',
            mvp: '#10b981',
            growth: '#f59e0b',
            scaling: '#ef4444',
        };
        return colors[stage] || colors.idea;
    };

    const handleLikeComment = async (commentId: string) => {
        if (!post || !user) return;
        try {
            const response = await api.put(`/projects/${post.id}/comment/${commentId}/like`);
            const updatedLikes = response.data;

            setPost((prev: any) => ({
                ...prev,
                comments: prev.comments.map((c: any) =>
                    c.id === commentId ? { ...c, likes: updatedLikes } : c
                )
            }));
        } catch (error) {
            console.error("Failed to like comment", error);
        }
    };

    const handleReplyComment = async (commentId: string) => {
        if (!replyText.trim() || !post) return;
        try {
            const response = await api.post(`/projects/${post.id}/comment/${commentId}/reply`, { content: replyText });
            const updatedComments = response.data.map((c: any) => ({
                ...c,
                id: c._id || c.id,
                author: { ...c.author, id: c.author?._id || c.author?.id },
                replies: (c.replies || []).map((r: any) => ({
                    ...r,
                    id: r._id || r.id,
                    author: { ...r.author, id: r.author?._id || r.author?.id }
                }))
            }));

            setPost((prev: any) => ({
                ...prev,
                comments: updatedComments
            }));
            setReplyText('');
            setReplyingTo(null);
        } catch (error) {
            console.error("Failed to post reply", error);
        }
    };
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim() && post) {
            try {
                const response = await api.post(`/projects/${post.id}/comment`, { content: commentText });

                const updatedComments = response.data.map((c: any) => ({
                    ...c,
                    id: c._id || c.id,
                    author: { ...c.author, id: c.author?._id || c.author?.id },
                    replies: (c.replies || []).map((r: any) => ({
                        ...r,
                        id: r._id || r.id,
                        author: { ...r.author, id: r.author?._id || r.author?.id }
                    }))
                }));

                setPost((prev: any) => ({
                    ...prev,
                    comments: updatedComments
                }));
                setCommentText('');
            } catch (error) {
                console.error("Failed to post comment", error);
            }
        }
    };

    const handleSupport = async () => {
        if (!post) return;
        const amount = prompt("Enter the amount you want to support with ($):", "10");
        if (!amount || isNaN(Number(amount))) return;

        try {
            const response = await api.post(`/projects/${post.id}/support`, { amount });
            setPost((prev: any) => ({
                ...prev,
                currentFunding: response.data.currentFunding
            }));
            alert(`Thank you for supporting this project with $${amount}!`);
        } catch (error) {
            console.error("Failed to support project", error);
        }
    };

    if (loading) return <div className="post-detail-layout">Loading...</div>;

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
                    { }
                    <div className="post-article__header">
                        <div className="post-article__author-row">
                            <Link to={`/profile/${post.author.username}`} className="post-article__avatar-link">
                                <img
                                    src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=A5D6B7&color=fff`}
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
                            {user && (post.author.id === user.id || (post.author as any)._id === user.id) && (
                                <div className="post-card__menu-container" style={{ position: 'relative' }}>
                                    <button className="post-article__more" onClick={() => setShowMenu(!showMenu)}>
                                        <MoreHorizontal size={20} />
                                    </button>
                                    {showMenu && (
                                        <div className="post-card__menu-dropdown" style={{ right: 0, top: '100%' }}>
                                            <button onClick={handleEdit} className="post-card__menu-item">
                                                <Edit size={16} /> Edit
                                            </button>
                                            <button onClick={handleDelete} disabled={isDeleting} className="post-card__menu-item post-card__menu-item--danger">
                                                {isDeleting ? 'Deleting...' : <><Trash2 size={16} /> Delete</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    { }
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
                            {post.content.split('\n').map((paragraph: string, index: number) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        { }
                        {post.media && post.media.length > 0 && (
                            <div className="post-article__media">
                                {post.media.map((url: string, idx: number) => (
                                    <div key={idx} className="post-article__media-item">
                                        <img src={url} alt="" />
                                    </div>
                                ))}
                            </div>
                        )}

                        { }
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
                                <button className="btn btn-primary btn--full" onClick={handleSupport}>Support Project</button>
                            </div>
                        )}

                        <div className="post-article__tags">
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="hashtag">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    { }
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

                    { }
                    <div className="post-article__actions">
                        <button
                            className={`action-btn ${isLiked ? 'active' : ''}`}
                            onClick={handleLike}
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

                    { }
                    <div className="post-article__comments">
                        <div className="comment-input-area">
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=A5D6B7&color=fff`}
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
                            {post.comments.map((comment: any) => (
                                <div key={comment.id} className="comment-item">
                                    <img
                                        src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.firstName}&background=A5D6B7&color=fff`}
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
                                        <button
                                            className={`comment-action-btn ${(comment.likes || []).includes(user?.id) ? 'active' : ''}`}
                                            onClick={() => handleLikeComment(comment.id)}
                                        >
                                            Like {(comment.likes || []).length > 0 && `(${comment.likes.length})`}
                                        </button>
                                        <span className="comment-item__dot-divider">•</span>
                                        <button
                                            className="comment-action-btn"
                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                        >
                                            Reply
                                        </button>
                                    </div>

                                    {replyingTo === comment.id && (
                                        <div className="reply-input-area">
                                            <input
                                                type="text"
                                                placeholder="Write a reply..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                autoFocus
                                            />
                                            <button
                                                disabled={!replyText.trim()}
                                                onClick={() => handleReplyComment(comment.id)}
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    )}

                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="replies-list">
                                            {comment.replies.map((reply: any) => (
                                                <div key={reply.id} className="comment-item reply-item">
                                                    <img
                                                        src={reply.author.avatar || `https://ui-avatars.com/api/?name=${reply.author.firstName}&background=A5D6B7&color=fff`}
                                                        alt={reply.author.firstName}
                                                        className="comment-item__avatar--sm"
                                                    />
                                                    <div className="comment-item__box">
                                                        <div className="comment-item__header">
                                                            <span className="comment-item__name">{reply.author.firstName} {reply.author.lastName}</span>
                                                            <span className="comment-item__headline">• {formatDate(reply.createdAt)}</span>
                                                        </div>
                                                        <p className="comment-item__text">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                            src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=A5D6B7&color=fff`}
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
                        <p className="text-muted text-sm">No other posts yet.</p>
                    </div>
                </div>
            </aside>
        </div >
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
