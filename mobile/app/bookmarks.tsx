import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Bookmark } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';
import api from '../services/api';
import PostCard from '../components/PostCard';
import { StatusBar } from 'expo-status-bar';

export default function BookmarksScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const activeColors = Colors[theme];

    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookmarks = async () => {
        try {
            const response = await api.get('/auth/bookmarks');
            setBookmarks(response.data);
        } catch (error) {
            console.error('Failed to fetch bookmarks', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookmarks();
    };

    const handleLike = async (postId: string) => {
        try {
            const targetPost = bookmarks.find(p => p.id === postId);
            const apiEndpoint = targetPost?.type === 'post' ? `/posts/${postId}/like` : `/projects/${postId}/like`;
            const response = await api.put(apiEndpoint);
            const updatedLikes = response.data;

            setBookmarks(current => current.map(post => {
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

    const handleBookmark = async (postId: string) => {
        try {
            const targetPost = bookmarks.find(p => p.id === postId);
            const apiEndpoint = targetPost?.type === 'post' ? `/posts/${postId}/bookmark` : `/projects/${postId}/bookmark`;
            await api.put(apiEndpoint);

            // Remove from local state since we are on the bookmarks screen
            setBookmarks(current => current.filter(p => p.id !== postId));
        } catch (error) {
            console.error('Failed to remove bookmark', error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: activeColors.border, backgroundColor: activeColors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Bookmarks</Text>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : (
                <FlatList
                    data={bookmarks}
                    keyExtractor={(item) => item.id || item._id}
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            onLike={() => handleLike(item.id)}
                            onBookmark={() => handleBookmark(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColors.tint} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Bookmark size={60} color={activeColors.muted} strokeWidth={1} />
                            <Text style={[styles.emptyTitle, { color: activeColors.text }]}>No Bookmarks Found</Text>
                            <Text style={[styles.emptySubtitle, { color: activeColors.muted }]}>
                                Save projects and posts to view them later here.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 10,
        bottom: 8,
        padding: 8,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.4,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
});
