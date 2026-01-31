import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../components/PostCard/PostCard';
import './SavedPage.css';

const SavedPage: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/projects/bookmarked');

                const adaptedPosts = response.data.map((p: any) => ({
                    ...p,
                    id: p._id || p.id,
                    likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
                    likedBy: Array.isArray(p.likes) ? p.likes : [],
                    comments: (p.comments || []).map((c: any) => ({
                        ...c,
                        id: c._id || c.id,
                        author: c.author ? { ...c.author, id: c.author._id || c.author.id } : null
                    })),
                    author: {
                        ...p.author,
                        id: p.author?._id || p.author?.id
                    }
                }));

                setPosts(adaptedPosts);
            } catch (error) {
                console.error("Failed to fetch saved posts", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSavedPosts();
    }, []);

    const handleLike = async (postId: string) => {
        try {
            const response = await api.put(`/projects/${postId}/like`);
            const updatedLikes = response.data;

            setPosts(currentPosts => currentPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: updatedLikes.length,
                        likedBy: updatedLikes
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error("Failed to like post", error);
        }
    };

    const handleDeletePost = (postId: string) => {
        setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
    };

    return (
        <div className="saved-page-layout">
            <header className="saved-page-header">
                <div className="saved-page-header__content">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="saved-page-header__title">
                        <Bookmark size={24} className="saved-icon" />
                        <h1>Saved Items</h1>
                    </div>
                </div>
            </header>

            <main className="saved-page-main">
                {isLoading ? (
                    <div className="loading-state">Loading your saved items...</div>
                ) : posts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">
                            <Bookmark size={48} />
                        </div>
                        <h3>No saved items yet</h3>
                        <p>Items you bookmark will appear here for easy access later.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/feed')}>
                            Explore Feed
                        </button>
                    </div>
                ) : (
                    <div className="saved-posts-list">
                        {posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={handleLike}
                                onDelete={handleDeletePost}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SavedPage;
