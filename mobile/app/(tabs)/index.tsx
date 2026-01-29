
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, Bell, MessageSquare, MessageSquareMore, Menu, CircleUser, Image as ImageIcon, Video, Calendar, Sparkles, Send } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';
import PostCard from '../../components/PostCard';

export default function FeedScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const activeColors = Colors[theme];

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/projects');
      // Adapt posts like in web app
      const adaptedPosts = response.data.map((p: any) => ({
        ...p,
        id: p._id || p.id,
        likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
        likedBy: Array.isArray(p.likes) ? p.likes : [],
        comments: p.comments || [],
        author: {
          ...p.author,
          id: p.author?._id || p.author?.id
        }
      }));
      setPosts(adaptedPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/messages')} style={styles.iconBtn}>
          <MessageSquareMore size={24} color={activeColors.text} fill={activeColors.text} />
          <View style={[styles.badge, { backgroundColor: '#ef4444' }]} />
        </TouchableOpacity>

        <View style={[styles.searchBar, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
          <Search size={18} color={activeColors.light} />
          <Text style={[styles.searchText, { color: activeColors.light }]}>Search ecosystem...</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={[styles.profileButton, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
        >
          {user?.avatar ? (
            <Image
              source={{ uri: getImageUrl(user.avatar) || '' }}
              style={styles.profilePic}
            />
          ) : (
            <CircleUser size={30} color={activeColors.tint} />
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.createCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
        <View style={styles.createTop}>
          <Image
            source={{ uri: getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=A5D6B7&color=fff` }}
            style={styles.createAvatar}
          />
          <TouchableOpacity
            style={[styles.createButtonTrigger, { backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f3f4f6' }]}
            onPress={() => router.push('/modal')}
          >
            <Text style={[styles.createPlaceholder, { color: activeColors.light }]}>Share your next breakthrough...</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.createDivider, { backgroundColor: activeColors.border }]} />
        <View style={styles.createActions}>
          <TouchableOpacity style={styles.createActionItem}>
            <ImageIcon size={18} color="#3b82f6" />
            <Text style={[styles.createActionText, { color: activeColors.muted }]}>Media</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createActionItem}>
            <Sparkles size={18} color="#8b5cf6" />
            <Text style={[styles.createActionText, { color: activeColors.muted }]}>Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createActionItem}>
            <Calendar size={18} color="#f59e0b" />
            <Text style={[styles.createActionText, { color: activeColors.muted }]}>Event</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Explore Innovation</Text>
        <TouchableOpacity>
          <Menu size={20} color={activeColors.light} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColors.tint} />
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: activeColors.muted }]}>No posts yet. Be the first to share!</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchText: {
    fontSize: 14,
  },
  iconBtn: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  createCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  createTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  createAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  createButtonTrigger: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  createPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
  },
  createDivider: {
    height: 1,
    width: '100%',
    marginBottom: 8,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  createActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  createActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
