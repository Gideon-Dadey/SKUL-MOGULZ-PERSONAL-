
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Platform, Modal, TextInput, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Plus, Bell, MessageCircle, Menu, CircleUser, Image as ImageIcon, Video, Calendar, Sparkles, Send, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';
import PostCard from '../../components/PostCard';

export default function FeedScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { socket } = useSocket();
  const router = useRouter();
  const activeColors = Colors[theme];

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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
        bookmarkedBy: p.bookmarkedBy || [],
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

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/conversations');
      const totalUnread = response.data.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
      setUnreadMessages(totalUnread);
    } catch (error) {
      console.error("Failed to fetch unread count on feed", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUnreadCount();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = () => {
      // Small delay to allow server aggregation to update if needed, 
      // or just refetch to be sure we have the latest
      fetchUnreadCount();
    };
    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

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

  const handleComment = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedPostId) return;

    try {
      setIsSubmittingComment(true);
      const response = await api.post(`/projects/${selectedPostId}/comment`, {
        content: commentText
      });

      setPosts(currentPosts => currentPosts.map(post => {
        if (post.id === selectedPostId) {
          return {
            ...post,
            comments: response.data
          };
        }
        return post;
      }));

      setCommentText('');
      setCommentModalVisible(false);
      Alert.alert('Success', 'Comment added!');
    } catch (error) {
      console.error('Failed to comment', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      // For now, just toggle locally - you'll need to add a bookmark API endpoint
      setPosts(currentPosts => currentPosts.map(post => {
        if (post.id === postId) {
          const isCurrentlyBookmarked = (post.bookmarkedBy || []).includes(user?.id);
          const newBookmarkedBy = isCurrentlyBookmarked
            ? (post.bookmarkedBy || []).filter((id: string) => id !== user?.id)
            : [...(post.bookmarkedBy || []), user?.id];

          return {
            ...post,
            bookmarkedBy: newBookmarkedBy
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to bookmark', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/messages')} style={styles.iconBtn}>
          <MessageCircle size={28} color={activeColors.text} strokeWidth={1.5} />
          {unreadMessages > 0 && (
            <View style={[styles.iOSBadge, { backgroundColor: '#FF3B30' }]}>
              <Text style={styles.iOSBadgeText}>{unreadMessages}</Text>
            </View>
          )}
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
          <TouchableOpacity style={styles.createActionItem} onPress={() => router.push('/modal')}>
            <ImageIcon size={18} color="#3b82f6" />
            <Text style={[styles.createActionText, { color: activeColors.muted }]}>Media</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createActionItem} onPress={() => router.push('/modal')}>
            <Sparkles size={18} color="#8b5cf6" />
            <Text style={[styles.createActionText, { color: activeColors.muted }]}>Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createActionItem} onPress={() => router.push('/modal')}>
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
        renderItem={({ item }) => <PostCard post={item} onLike={handleLike} onComment={handleComment} onBookmark={handleBookmark} />}
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

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCommentModalVisible(false)}
          />
          <View style={[styles.commentModal, { backgroundColor: activeColors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: activeColors.border }]}>
              <Text style={[styles.modalTitle, { color: activeColors.text }]}>Add Comment</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <X size={24} color={activeColors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.commentInputContainer}>
              <Image
                source={{ uri: getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=A5D6B7&color=fff` }}
                style={styles.commentAvatar}
              />
              <TextInput
                style={[styles.commentInput, { backgroundColor: activeColors.background, color: activeColors.text, borderColor: activeColors.border }]}
                placeholder="Share your thoughts..."
                placeholderTextColor={activeColors.light}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.submitCommentBtn, { backgroundColor: activeColors.tint, opacity: commentText.trim() ? 1 : 0.5 }]}
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Send size={18} color="#fff" />
                  <Text style={styles.submitCommentText}>Post Comment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  iOSBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 2,
  },
  iOSBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  commentModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  commentInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  submitCommentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitCommentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
