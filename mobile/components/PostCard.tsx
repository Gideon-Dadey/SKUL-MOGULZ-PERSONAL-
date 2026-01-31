
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Share, Alert, Modal, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Play } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
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
    const [isVideo, setIsVideo] = useState(false);

    const imageUrl = post.media && post.media.length > 0 ? getImageUrl(post.media[0]) : null;

    useEffect(() => {
        if (imageUrl) {
            const isVid = imageUrl.match(/\.(mp4|mov|webm|quicktime)$/i) || post.media[0].includes('video');
            setIsVideo(!!isVid);

            if (!isVid) {
                Image.getSize(imageUrl, (width, height) => {
                    if (width && height) {
                        setAspectRatio(width / height);
                    }
                }, (error) => {
                    console.warn('Failed to get image size:', error);
                });
            } else {
                setAspectRatio(16 / 9); // Default video aspect ratio
            }
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
        <View style={[styles.container, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
            <View style={styles.postLayout}>
                {/* Left Column: Avatar */}
                <View style={styles.leftColumn}>
                    <TouchableOpacity onPress={() => router.push(`/profile/${post.author.username}` as any)}>
                        <Image
                            source={post.author.avatar ? { uri: getImageUrl(post.author.avatar) } : require('../assets/images/icon.png')}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>

                {/* Right Column: Everything else */}
                <View style={styles.rightColumn}>
                    {/* Header: Name, Username, Time, More */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.authorTextInfo}
                            onPress={() => router.push(`/profile/${post.author.username}` as any)}
                        >
                            <Text style={[styles.authorName, { color: activeColors.text }]} numberOfLines={1}>
                                {post.author.firstName} {post.author.lastName}
                            </Text>
                            <Text style={[styles.metaText, { color: activeColors.muted }]} numberOfLines={1}>
                                @{post.author.username} · {formatDate(post.createdAt)}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.headerRight}>
                            <View style={[styles.stageBadge, { backgroundColor: `${getStageColor(post.projectStage)}15` }]}>
                                <Text style={[styles.stageText, { color: getStageColor(post.projectStage) }]}>
                                    {post.projectStage}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleMorePress} style={styles.moreBtn}>
                                <MoreHorizontal size={16} color={activeColors.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content: Title & Body */}
                    <TouchableOpacity
                        style={styles.contentArea}
                        activeOpacity={0.7}
                        onPress={() => router.push(('/post/' + post.id) as any)}
                    >
                        <Text style={[styles.title, { color: activeColors.text }]}>{post.title}</Text>
                        <Text style={[styles.body, { color: activeColors.text }]} numberOfLines={4}>
                            {post.content}
                        </Text>
                    </TouchableOpacity>

                    {/* Media */}
                    {imageUrl && (
                        <View style={styles.mediaWrapper}>
                            <TouchableOpacity
                                style={[styles.mediaContainer, { aspectRatio }]}
                                activeOpacity={isVideo ? 1 : 0.9}
                                onPress={() => !isVideo && setViewImage(true)}
                            >
                                {isVideo ? (
                                    <Video
                                        source={{ uri: imageUrl }}
                                        style={styles.mainMedia}
                                        useNativeControls
                                        resizeMode={ResizeMode.COVER}
                                        isLooping
                                        shouldPlay={false}
                                    />
                                ) : (
                                    <Image source={{ uri: imageUrl }} style={styles.mainMedia} resizeMode="cover" />
                                )}
                            </TouchableOpacity>

                            {!isVideo && (
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
                            )}
                        </View>
                    )}

                    {/* Tags */}
                    <View style={styles.tagsRow}>
                        <Text style={[styles.category, { color: activeColors.tint }]}>{post.category}</Text>
                        {post.tags?.slice(0, 2).map((tag: string) => (
                            <Text key={tag} style={[styles.tag, { color: activeColors.muted }]}>#{tag}</Text>
                        ))}
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment?.(post.id)}>
                            <MessageCircle size={18} color={activeColors.muted} />
                            <Text style={[styles.actionText, { color: activeColors.muted }]}>{post.comments?.length || 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike?.(post.id)}>
                            <Heart
                                size={18}
                                color={isLiked ? '#F91880' : activeColors.muted}
                                fill={isLiked ? '#F91880' : 'transparent'}
                            />
                            <Text style={[styles.actionText, { color: isLiked ? '#F91880' : activeColors.muted }]}>{post.likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                            <Share2 size={18} color={activeColors.muted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn} onPress={() => onBookmark?.(post.id)}>
                            <Bookmark
                                size={18}
                                color={isBookmarked ? activeColors.tint : activeColors.muted}
                                fill={isBookmarked ? activeColors.tint : 'transparent'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    postLayout: {
        flexDirection: 'row',
    },
    leftColumn: {
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f0f0',
    },
    rightColumn: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    authorTextInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 4,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '700',
    },
    metaText: {
        fontSize: 14,
        flexShrink: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    moreBtn: {
        padding: 4,
    },
    stageBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    stageText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    contentArea: {
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    body: {
        fontSize: 15,
        lineHeight: 20,
    },
    mediaWrapper: {
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    mediaContainer: {
        width: '100%',
        backgroundColor: '#000',
    },
    mainMedia: {
        width: '100%',
        height: '100%',
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '400',
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
});
