
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, Bell, MessageSquare, Menu } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';
import api from '../../services/api';
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
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image
            source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=A5D6B7&color=fff` }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
          <Search size={18} color={activeColors.light} />
          <Text style={[styles.searchText, { color: activeColors.light }]}>Search projects...</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/messages')}>
          <MessageSquare size={24} color={activeColors.light} />
        </TouchableOpacity>
      </View>

      <View style={styles.createBox}>
        <TouchableOpacity
          style={[styles.createInput, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
          onPress={() => router.push('/modal')}
        >
          <Text style={{ color: activeColors.light }}>Share a project update...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.plusBtn, { backgroundColor: activeColors.tint }]}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
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
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  createBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  createInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  plusBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
