
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Share, Alert, Modal, Dimensions } from 'react-native';
import { Heart, MessageSquareText, Share2, Bookmark, MoreHorizontal, Play, Repeat, MapPin } from 'lucide-react-native';
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
    onRepost?: (postId: string) => void;
    onBookmark?: (postId: string) => void;
    onEdit?: (post: any) => void;
    onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onLike, onComment, onRepost, onBookmark, onEdit, onDelete }: PostCardProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const activeColors = Colors[theme];
    const [aspectRatio, setAspectRatio] = useState(1);
    const [viewImage, setViewImage] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [status, setStatus] = useState<any>({});

    const isRepost = !!post.repostOf;
    const originalPost = isRepost ? post.repostOf : post;
    const displayAuthor = isRepost ? (post.author || originalPost.author) : originalPost.author;
    const isProject = originalPost.type === 'project' || (!!originalPost.title && !!originalPost.projectStage);

    const imageUrl = originalPost.media && originalPost.media.length > 0 ? getImageUrl(originalPost.media[0]) : null;

    useEffect(() => {
        if (imageUrl) {
            const isVid = imageUrl.match(/\.(mp4|mov|webm|quicktime)$/i) || originalPost.media[0].includes('video');
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

    const isLiked = user && (
        Array.isArray(originalPost.likedBy) ? originalPost.likedBy.includes(user.id) :
            Array.isArray(originalPost.likes) ? originalPost.likes.includes(user.id) :
                false
    );
    const isBookmarked = user && (
        Array.isArray(user.bookmarks) ? user.bookmarks.includes(originalPost._id || originalPost.id) :
            Array.isArray(originalPost.bookmarkedBy) ? originalPost.bookmarkedBy.includes(user.id) :
                false
    );
    const isReposted = user && (
        Array.isArray(originalPost.reposts) ? originalPost.reposts.includes(user.id) :
            false
    );

    const likesCount = Array.isArray(originalPost.likes) ? originalPost.likes.length : (originalPost.likes || 0);
    const repostsCount = Array.isArray(originalPost.reposts) ? originalPost.reposts.length : (originalPost.reposts || 0);
    const commentsCount = Array.isArray(originalPost.comments) ? originalPost.comments.length : (originalPost.comments || 0);

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
            isProject ? 'Project Options' : 'Post Options',
            'What would you like to do?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: isProject ? 'Edit Project' : 'Edit Post', onPress: () => onEdit?.(post) },
                {
                    text: isProject ? 'Delete Project' : 'Delete Post',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            isProject ? 'Delete Project' : 'Delete Post',
                            `Are you sure you want to delete this ${isProject ? 'project' : 'post'}? This action cannot be undone.`,
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
            {isRepost && (
                <View style={styles.repostHeader}>
                    <Repeat size={14} color={activeColors.muted} style={{ marginRight: 12 }} />
                    <Text style={[styles.repostHeaderText, { color: activeColors.muted }]}>
                        {post.author.firstName} {post.author.lastName} reposted
                    </Text>
                </View>
            )}
            <View style={styles.postLayout}>
                {/* Left Column: Avatar */}
                <View style={styles.leftColumn}>
                    <TouchableOpacity onPress={() => router.push(`/profile/${displayAuthor.username}` as any)}>
                        <Image
                            source={displayAuthor.avatar ? { uri: getImageUrl(displayAuthor.avatar) } : require('../assets/images/icon.png')}
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
                            onPress={() => router.push(`/profile/${displayAuthor.username}` as any)}
                        >
                            <Text style={[styles.authorName, { color: activeColors.text }]} numberOfLines={1}>
                                {displayAuthor.firstName} {displayAuthor.lastName}
                            </Text>
                            <Text style={[styles.metaText, { color: activeColors.muted }]} numberOfLines={1}>
                                {formatDate(originalPost.createdAt)}
                                {originalPost.location && (
                                    <>
                                        {' · '}
                                        <MapPin size={12} color={activeColors.muted} />
                                        {` ${originalPost.location}`}
                                    </>
                                )}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.headerRight}>
                            {isProject && (
                                <View style={[styles.stageBadge, { backgroundColor: `${getStageColor(originalPost.projectStage)}15` }]}>
                                    <Text style={[styles.stageText, { color: getStageColor(originalPost.projectStage) }]}>
                                        {originalPost.projectStage}
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity onPress={handleMorePress} style={styles.moreBtn}>
                                <MoreHorizontal size={16} color={activeColors.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.contentArea}
                        activeOpacity={0.7}
                        onPress={() => router.push(('/post/' + (originalPost._id || originalPost.id)) as any)}
                    >
                        {isProject && originalPost.title && (
                            <Text style={[styles.title, { color: activeColors.text }]}>{originalPost.title}</Text>
                        )}
                        <Text style={[styles.body, { color: activeColors.text, fontSize: isProject ? 15 : 17, lineHeight: isProject ? 20 : 24 }]} numberOfLines={isProject ? 4 : 8}>
                            {originalPost.content}
                        </Text>
                    </TouchableOpacity>

                    {/* Media */}
                    {imageUrl && (
                        <View style={styles.mediaWrapper}>
                            <TouchableOpacity
                                style={[styles.mediaContainer, { aspectRatio }]}
                                activeOpacity={1}
                                onPress={() => {
                                    if (isVideo) {
                                        // Toggle play/pause on tap
                                        setStatus((s: any) => ({ ...s, shouldPlay: !s.shouldPlay }));
                                    } else {
                                        setViewImage(true);
                                    }
                                }}
                            >
                                {isVideo ? (
                                    <View style={{ flex: 1 }}>
                                        <Video
                                            source={{ uri: imageUrl }}
                                            style={styles.mainMedia}
                                            useNativeControls={status.isPlaying}
                                            resizeMode={ResizeMode.CONTAIN}
                                            isLooping
                                            shouldPlay={status.shouldPlay}
                                            onPlaybackStatusUpdate={s => setStatus(s)}
                                        />
                                        {!status.isPlaying && (
                                            <View style={styles.playOverlay}>
                                                <View style={styles.playCircle}>
                                                    <Play size={32} color="#fff" fill="#fff" />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <Image source={{ uri: imageUrl }} style={styles.mainMedia} resizeMode="contain" />
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

                    {/* Tags & Meta (Projects Only) */}
                    {isProject && (
                        <View style={styles.tagsRow}>
                            <Text style={[styles.category, { color: activeColors.tint }]}>{originalPost.category}</Text>
                            {originalPost.tags?.slice(0, 2).map((tag: string) => (
                                <Text key={tag} style={[styles.tag, { color: activeColors.muted }]}>#{tag}</Text>
                            ))}
                        </View>
                    )}

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment?.(originalPost._id || originalPost.id)}>
                            <MessageSquareText size={18} color={activeColors.muted} />
                            <Text style={[styles.actionText, { color: activeColors.muted }]}>{commentsCount}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn} onPress={() => onRepost?.(originalPost._id || originalPost.id)}>
                            <Repeat
                                size={18}
                                color={isReposted ? '#00BA7C' : activeColors.muted}
                            />
                            <Text style={[styles.actionText, { color: isReposted ? '#00BA7C' : activeColors.muted }]}>
                                {repostsCount}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike?.(originalPost._id || originalPost.id)}>
                            <Heart
                                size={18}
                                color={isLiked ? '#F91880' : activeColors.muted}
                                fill={isLiked ? '#F91880' : 'transparent'}
                            />
                            <Text style={[styles.actionText, { color: isLiked ? '#F91880' : activeColors.muted }]}>
                                {likesCount}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                            <Share2 size={18} color={activeColors.muted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn} onPress={() => onBookmark?.(originalPost._id || originalPost.id)}>
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
    repostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 36, // Align text with name
        marginBottom: 8,
    },
    repostHeaderText: {
        fontSize: 13,
        fontWeight: '600',
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
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    playCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 4, // Visual centering for play icon
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
