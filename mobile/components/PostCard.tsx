
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Share, Alert, Modal, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Post } from '../types';
import Colors from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';

interface PostCardProps {
    post: any;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onBookmark?: (postId: string) => void;
    onEdit?: (post: any) => void;
    onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onLike, onComment, onBookmark, onEdit, onDelete }: PostCardProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const activeColors = Colors[theme];
    const [aspectRatio, setAspectRatio] = useState(1);
    const [viewImage, setViewImage] = useState(false);

    const imageUrl = post.media && post.media.length > 0 ? getImageUrl(post.media[0]) : null;

    useEffect(() => {
        if (imageUrl) {
            Image.getSize(imageUrl, (width, height) => {
                if (width && height) {
                    setAspectRatio(width / height);
                }
            }, (error) => {
                console.warn('Failed to get image size:', error);
            });
        }
    }, [imageUrl]);

    const isLiked = user && (post.likedBy || []).includes(user.id);
    const isBookmarked = user && (post.bookmarkedBy || []).includes(user.id);

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

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this project on SKUL MOGULZ: ${post.title}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleMorePress = () => {
        const isAuthor = user && (user.id === post.author.id || user.id === post.author._id);

        if (!isAuthor) {
            Alert.alert('Options', 'Select an action', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Report Post', onPress: () => Alert.alert('Reported', 'Thank you for your feedback.') }
            ]);
            return;
        }

        Alert.alert(
            'Project Options',
            'What would you like to do?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit Project', onPress: () => onEdit?.(post) },
                {
                    text: 'Delete Project',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Delete Project',
                            'Are you sure you want to delete this project? This action cannot be undone.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(post.id) }
                            ]
                        );
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.header}>
                <View style={styles.authorInfo}>
                    <Image
                        source={post.author.avatar ? { uri: getImageUrl(post.author.avatar) } : require('../assets/images/icon.png')}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={[styles.authorName, { color: activeColors.text }]}>{post.author.firstName} {post.author.lastName}</Text>
                        <Text style={[styles.metaText, { color: activeColors.muted }]}>@{post.author.username} · {formatDate(post.createdAt)}</Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <View style={[styles.stageBadge, { backgroundColor: `${getStageColor(post.projectStage)}20` }]}>
                        <Text style={[styles.stageText, { color: getStageColor(post.projectStage) }]}>
                            {post.projectStage?.charAt(0).toUpperCase() + post.projectStage?.slice(1)}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleMorePress}>
                        <MoreHorizontal size={20} color={activeColors.light} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.content} activeOpacity={0.7} onPress={() => router.push(('/post/' + post.id) as any)}>
                <Text style={[styles.title, { color: activeColors.text }]}>{post.title}</Text>
                <Text style={[styles.body, { color: activeColors.muted }]} numberOfLines={3}>
                    {post.content}
                </Text>
            </TouchableOpacity>

            {imageUrl && (
                <View>
                    <TouchableOpacity
                        style={[styles.mediaContainer, { aspectRatio }]}
                        activeOpacity={0.9}
                        onPress={() => setViewImage(true)}
                    >
                        <Image source={{ uri: imageUrl }} style={styles.mainMedia} />
                    </TouchableOpacity>

                    <Modal visible={viewImage} transparent={true} onRequestClose={() => setViewImage(false)} animationType="fade">
                        <View style={styles.modalContainer}>
                            <TouchableOpacity
                                style={styles.modalBackground}
                                activeOpacity={1}
                                onPress={() => setViewImage(false)}
                            >
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={styles.fullscreenImage}
                                    resizeMode="contain"
                                />
                                <TouchableOpacity
                                    style={styles.closeFullscreen}
                                    onPress={() => setViewImage(false)}
                                >
                                    <View style={styles.closeBadge}>
                                        <Text style={styles.closeText}>Close</Text>
                                    </View>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </View>
            )}

            <View style={styles.tagsContainer}>
                <Text style={[styles.category, { color: activeColors.tint }]}>{post.category}</Text>
                {post.tags?.slice(0, 2).map((tag: string) => (
                    <Text key={tag} style={[styles.tag, { color: activeColors.muted }]}>#{tag}</Text>
                ))}
            </View>

            <View style={[styles.footer, { borderTopColor: activeColors.border }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onLike?.(post.id)}>
                    <Heart size={20} color={isLiked ? activeColors.tint : activeColors.light} fill={isLiked ? activeColors.tint : 'transparent'} />
                    <Text style={[styles.actionText, { color: isLiked ? activeColors.tint : activeColors.muted }]}>{post.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => onComment?.(post.id)}>
                    <MessageCircle size={20} color={activeColors.light} />
                    <Text style={[styles.actionText, { color: activeColors.muted }]}>{post.comments?.length || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                    <Share2 size={20} color={activeColors.light} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => onBookmark?.(post.id)}>
                    <Bookmark size={20} color={isBookmarked ? activeColors.tint : activeColors.light} fill={isBookmarked ? activeColors.tint : 'transparent'} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        marginBottom: 0,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '700',
    },
    metaText: {
        fontSize: 12,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stageBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    stageText: {
        fontSize: 11,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    body: {
        fontSize: 14,
        lineHeight: 20,
    },
    mediaContainer: {
        width: '100%',
        backgroundColor: '#000',
    },
    mainMedia: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: '100%',
        height: '100%',
    },
    closeFullscreen: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    closeBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    closeText: {
        color: '#fff',
        fontWeight: '700',
    },
    tagsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        alignItems: 'center',
    },
    category: {
        fontSize: 13,
        fontWeight: '700',
    },
    tag: {
        fontSize: 13,
    },
    footer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        justifyContent: 'space-between',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
