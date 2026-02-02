
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Heart, MessageSquareText, Share2, Bookmark, Send, MoreHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export default function PostDetailScreen() {
    const { id, type } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const activeColors = Colors[theme];
    const inputRef = useRef<TextInput>(null);

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { socket } = useSocket();
    const [replyingTo, setReplyingTo] = useState<any>(null); // { id, authorName }
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        if (id) fetchPostDetails();
    }, [id, type]);

    useEffect(() => {
        if (!socket || !id) return;

        const handleNotification = (notif: any) => {
            // If the notification is related to this post, refresh
            if (notif.project?._id === id || notif.project === id) {
                fetchPostDetails();
            }
        };

        socket.on('notification', handleNotification);
        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, id]);

    const fetchPostDetails = async () => {
        try {
            const apiEndpoint = (type === 'post' || post?.type === 'post') ? `/posts/${id}` : `/projects/${id}`;
            const response = await api.get(apiEndpoint);
            const data = response.data;
            const adaptedPost = {
                ...data,
                id: data._id || data.id,
                likes: Array.isArray(data.likes) ? data.likes.length : (data.likes || 0),
                likedBy: Array.isArray(data.likes) ? data.likes : [],
                comments: data.comments || [],
                author: {
                    ...data.author,
                    id: data.author?._id || data.author?.id
                }
            };
            setPost(adaptedPost);
        } catch (error) {
            console.error('Failed to fetch post details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            const apiEndpoint = (type === 'post' || post?.type === 'post') ? `/posts/${post.id}/like` : `/projects/${post.id}/like`;
            const response = await api.put(apiEndpoint);
            const updatedLikes = response.data;
            setPost((prev: any) => ({
                ...prev,
                likes: updatedLikes.length,
                likedBy: updatedLikes
            }));
        } catch (error) {
            console.error('Failed to like post', error);
        }
    };

    const handleLikeComment = async (commentId: string) => {
        try {
            const apiEndpoint = (type === 'post' || post?.type === 'post') ? `/posts/${post.id}/comment/${commentId}/like` : `/projects/${post.id}/comment/${commentId}/like`;
            const response = await api.put(apiEndpoint);
            const updatedLikes = response.data;
            setPost((prev: any) => ({
                ...prev,
                comments: prev.comments.map((c: any) =>
                    (c._id === commentId || c.id === commentId) ? { ...c, likes: updatedLikes } : c
                )
            }));
        } catch (error) {
            console.error('Failed to like comment', error);
        }
    };

    const handleReplyComment = async () => {
        if (!replyText.trim() || !replyingTo) return;

        try {
            setSubmitting(true);
            Keyboard.dismiss();
            const apiEndpoint = (type === 'post' || post?.type === 'post') ? `/posts/${post.id}/comment/${replyingTo.id}/reply` : `/projects/${post.id}/comment/${replyingTo.id}/reply`;
            await api.post(apiEndpoint, {
                content: replyText
            });
            setReplyText('');
            setReplyingTo(null);
            fetchPostDetails(); // Refresh to get the new reply
        } catch (error) {
            console.error('Failed to post reply', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;

        try {
            setSubmitting(true);
            Keyboard.dismiss();
            const apiEndpoint = (type === 'post' || post?.type === 'post') ? `/posts/${post.id}/comment` : `/projects/${post.id}/comment`;
            await api.post(apiEndpoint, {
                content: commentText
            });
            setCommentText('');
            fetchPostDetails(); // Refresh to get the new comment
        } catch (error) {
            console.error('Failed to post comment', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStageColor = (stage: string) => {
        const colors: any = {
            idea: '#8b5cf6',
            prototype: '#3b82f6',
            mvp: '#10b981',
            growth: '#f59e0b',
            scaling: '#ef4444',
        };
        return colors[stage] || '#666';
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: activeColors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={activeColors.tint} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: activeColors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={{ color: activeColors.text }}>Post not found</Text>
            </View>
        );
    }

    const isLiked = user && (post.likedBy || []).includes(user.id);

    const renderComment = ({ item }: { item: any }) => {
        const commentIsLiked = user && (item.likes || []).includes(user.id);

        return (
            <View style={[styles.commentItem, { borderBottomColor: activeColors.border }]}>
                <Image
                    source={{ uri: getImageUrl(item.author?.avatar) || `https://ui-avatars.com/api/?name=${item.author?.firstName || 'User'}&background=A5D6B7&color=fff` }}
                    style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                        <Text style={[styles.commentAuthor, { color: activeColors.text }]}>
                            {item.author?.firstName} {item.author?.lastName}
                        </Text>
                        <Text style={[styles.commentDate, { color: activeColors.muted }]}>
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text style={[styles.commentText, { color: activeColors.text }]}>{item.content}</Text>

                    <View style={styles.commentActions}>
                        <TouchableOpacity
                            style={styles.commentActionBtn}
                            onPress={() => handleLikeComment(item._id || item.id)}
                        >
                            <Heart
                                size={14}
                                color={commentIsLiked ? activeColors.tint : activeColors.muted}
                                fill={commentIsLiked ? activeColors.tint : 'transparent'}
                            />
                            <Text style={[styles.commentActionText, { color: commentIsLiked ? activeColors.tint : activeColors.muted }]}>
                                {item.likes?.length || 0}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.commentActionBtn}
                            onPress={() => {
                                setReplyingTo({ id: item._id || item.id, authorName: item.author?.firstName });
                                inputRef.current?.focus();
                            }}
                        >
                            <MessageSquareText size={14} color={activeColors.muted} />
                            <Text style={[styles.commentActionText, { color: activeColors.muted }]}>Reply</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Replies */}
                    {item.replies && item.replies.length > 0 && (
                        <View style={styles.repliesContainer}>
                            {item.replies.map((reply: any) => (
                                <View key={reply._id || reply.id} style={styles.replyItem}>
                                    <Image
                                        source={{ uri: getImageUrl(reply.author?.avatar) || `https://ui-avatars.com/api/?name=${reply.author?.firstName || 'User'}&background=A5D6B7&color=fff` }}
                                        style={styles.replyAvatar}
                                    />
                                    <View style={styles.replyContent}>
                                        <Text style={[styles.replyAuthor, { color: activeColors.text }]}>
                                            {reply.author?.firstName} {reply.author?.lastName}
                                        </Text>
                                        <Text style={[styles.commentText, { color: activeColors.text, fontSize: 13 }]}>{reply.content}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: activeColors.background }]}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border, paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Post</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={post.comments}
                renderItem={renderComment}
                keyExtractor={(item, index) => item._id || index.toString()}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={styles.postContainer}>
                        {/* Author Info */}
                        <View style={styles.authorSection}>
                            <Image
                                source={{ uri: getImageUrl(post.author.avatar) || `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=A5D6B7&color=fff` }}
                                style={styles.avatar}
                            />
                            <View>
                                <Text style={[styles.authorName, { color: activeColors.text }]}>
                                    {post.author.firstName} {post.author.lastName}
                                </Text>
                                <Text style={[styles.authorUsername, { color: activeColors.muted }]}>
                                    @{post.author.username}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }} />
                            <View style={[styles.stageBadge, { backgroundColor: `${getStageColor(post.projectStage)}20` }]}>
                                <Text style={[styles.stageText, { color: getStageColor(post.projectStage) }]}>
                                    {post.projectStage?.charAt(0).toUpperCase() + post.projectStage?.slice(1)}
                                </Text>
                            </View>
                            <TouchableOpacity style={{ marginLeft: 8 }}>
                                <MoreHorizontal size={20} color={activeColors.muted} />
                            </TouchableOpacity>
                        </View>

                        {/* Post Content */}
                        <Text style={[styles.contentTitle, { color: activeColors.text }]}>{post.title}</Text>
                        <Text style={[styles.contentBody, { color: activeColors.text }]}>{post.content}</Text>

                        {/* Media */}
                        {post.media && post.media.length > 0 && (
                            <View style={styles.mediaContainer}>
                                <Image source={{ uri: getImageUrl(post.media[0]) || '' }} style={styles.mediaImage} />
                            </View>
                        )}

                        {/* Metadata */}
                        <View style={[styles.metadataContainer, { borderBottomColor: activeColors.border }]}>
                            <Text style={[styles.metadataText, { color: activeColors.muted }]}>
                                {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {formatDate(post.createdAt)}
                            </Text>
                        </View>

                        {/* Stats */}
                        <View style={[styles.statsContainer, { borderBottomColor: activeColors.border }]}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: activeColors.text }]}>{post.likes}</Text>
                                <Text style={[styles.statLabel, { color: activeColors.muted }]}> Likes</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: activeColors.text }]}>{post.comments.length}</Text>
                                <Text style={[styles.statLabel, { color: activeColors.muted }]}> Comments</Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={[styles.actionsContainer, { borderBottomColor: activeColors.border }]}>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                                <Heart size={22} color={isLiked ? activeColors.tint : activeColors.muted} fill={isLiked ? activeColors.tint : 'transparent'} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => inputRef.current?.focus()}>
                                <MessageSquareText size={22} color={activeColors.muted} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}>
                                <Bookmark size={22} color={activeColors.muted} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}>
                                <Share2 size={22} color={activeColors.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Comment/Reply Input */}
            {replyingTo && (
                <View style={[styles.replyStatus, { backgroundColor: activeColors.card, borderTopColor: activeColors.border }]}>
                    <Text style={[styles.replyStatusText, { color: activeColors.muted }]}>
                        Replying to <Text style={{ fontWeight: '700' }}>{replyingTo.authorName}</Text>
                    </Text>
                    <TouchableOpacity onPress={() => setReplyingTo(null)}>
                        <Text style={{ color: activeColors.tint }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={[styles.inputContainer, { backgroundColor: activeColors.card, borderTopColor: activeColors.border }]}>
                <Image
                    source={{ uri: getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=A5D6B7&color=fff` }}
                    style={styles.inputAvatar}
                />
                <TextInput
                    ref={inputRef}
                    style={[styles.input, { backgroundColor: activeColors.background, color: activeColors.text }]}
                    placeholder={replyingTo ? "Post your reply" : "Post your thoughts"}
                    placeholderTextColor={activeColors.muted}
                    value={replyingTo ? replyText : commentText}
                    onChangeText={replyingTo ? setReplyText : setCommentText}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendBtn, { opacity: (replyingTo ? replyText.trim() : commentText.trim()) ? 1 : 0.5 }]}
                    disabled={submitting || (replyingTo ? !replyText.trim() : !commentText.trim())}
                    onPress={replyingTo ? handleReplyComment : handleSubmitComment}
                >
                    <Send size={20} color={activeColors.tint} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        minHeight: 80,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 20,
    },
    postContainer: {
        padding: 16,
    },
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    authorName: {
        fontWeight: '700',
        fontSize: 16,
    },
    authorUsername: {
        fontSize: 14,
    },
    stageBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    stageText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    contentTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    contentBody: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 12,
    },
    mediaContainer: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: '#f0f0f0',
    },
    mediaImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    metadataContainer: {
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    metadataText: {
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statValue: {
        fontWeight: '700',
        fontSize: 14,
    },
    statLabel: {
        fontSize: 14,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderBottomWidth: 1,
        marginBottom: 12,
    },
    actionBtn: {
        padding: 8,
    },
    commentItem: {
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 1,
        gap: 12,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthor: {
        fontWeight: '700',
        fontSize: 14,
    },
    commentDate: {
        fontSize: 12,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        gap: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    },
    inputAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 40,
        maxHeight: 100,
    },
    sendBtn: {
        padding: 8,
    },
    commentActions: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 16,
    },
    commentActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentActionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    repliesContainer: {
        marginTop: 12,
        gap: 12,
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(0,0,0,0.05)',
        paddingLeft: 12,
    },
    replyItem: {
        flexDirection: 'row',
        gap: 10,
    },
    replyAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    replyContent: {
        flex: 1,
    },
    replyAuthor: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 2,
    },
    replyStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
    },
    replyStatusText: {
        fontSize: 12,
    },
});
