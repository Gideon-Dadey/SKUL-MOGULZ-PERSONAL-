
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Platform, Modal, TextInput, KeyboardAvoidingView, Alert, ActivityIndicator, Dimensions, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Plus, Bell, MessageCircle, Menu, CircleUser, Image as ImageIcon, Video, Calendar, FileText, Send, X, MapPin, ChevronDown, MessagesSquare, Cpu, Activity, Landmark, GraduationCap, Leaf, Film, ShoppingBag, Globe, Bot, Sparkles, Layers, SlidersHorizontal, Bookmark, Ban, VolumeX, HelpCircle, Settings, LogOut, UserPlus, BarChart2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';
import PostCard from '../../components/PostCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const { socket } = useSocket();
  const router = useRouter();
  const activeColors = Colors[theme];

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showAccountsMenu, setShowAccountsMenu] = useState(false);
  const [showAnalyticsMenu, setShowAnalyticsMenu] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [analytics, setAnalytics] = useState({ profileViews: 0, postImpressions: 0 });
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');

  // Scroll tracking for sticky header
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const STICKY_HEADER_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

  // Reset accounts menu when side menu closes
  useEffect(() => {
    if (!menuVisible) {
      setShowAccountsMenu(false);
      setShowAnalyticsMenu(false);
    }
  }, [menuVisible]);

  const categories = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'technology', label: 'Technology', icon: Cpu },
    { id: 'healthcare', label: 'Healthcare', icon: Activity },
    { id: 'fintech', label: 'FinTech', icon: Landmark },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'sustainability', label: 'Sustainability', icon: Leaf },
    { id: 'entertainment', label: 'Entertainment', icon: Film },
    { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingBag },
    { id: 'social', label: 'Social Impact', icon: Globe },
    { id: 'ai', label: 'AI & Machine Learning', icon: Bot },
    { id: 'other', label: 'Other', icon: Sparkles },
  ];

  const stages = [
    { id: 'all', label: 'All Stages' },
    { id: 'idea', label: 'Idea' },
    { id: 'prototype', label: 'Prototype' },
    { id: 'mvp', label: 'MVP' },
    { id: 'growth', label: 'Growth' },
    { id: 'scaling', label: 'Scaling' },
  ];

  const fetchPosts = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get('/projects', {
        params: {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          stage: selectedStage === 'all' ? undefined : selectedStage
        }
      });
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
    if (!isAuthenticated || !user) return;
    try {
      const response = await api.get('/messages/conversations');
      const totalUnread = response.data.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
      setUnreadMessages(totalUnread);
    } catch (error) {
      console.warn("Failed to fetch unread count on feed", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPosts();
      fetchUnreadCount();
    }
  }, [user, isAuthenticated, selectedCategory, selectedStage]);

  const fetchConnectionCount = async () => {
    try {
      const response = await api.get('/network/stats');
      setConnectionCount(response.data.connectionsCount);
    } catch (error) {
      console.log("Failed to fetch connection stats", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics');
      setAnalytics({
        profileViews: response.data.summary.profileViews,
        postImpressions: response.data.summary.totalViews
      });
    } catch (error) {
      console.log("Failed to fetch analytics", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && user) {
        fetchPosts();
        fetchUnreadCount();
        fetchConnectionCount();
        fetchAnalytics();
      }
    }, [user, isAuthenticated])
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

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Show sticky header when scrolled past the top bar area
    if (offsetY > 80 && !showStickyHeader) {
      setShowStickyHeader(true);
    } else if (offsetY <= 80 && showStickyHeader) {
      setShowStickyHeader(false);
    }
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

  const handleEditPost = (post: any) => {
    router.push({
      pathname: '/modal',
      params: { editId: post.id }
    });
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete(`/projects/${postId}`);
      setPosts(currentPosts => currentPosts.filter(p => p.id !== postId));
      Alert.alert('Success', 'Project deleted');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete project');
    }
  };

  const renderStickyHeader = () => (
    <Animated.View
      style={[
        styles.stickyHeader,
        {
          backgroundColor: theme === 'dark' ? activeColors.card : '#FFFFFF',
          opacity: showStickyHeader ? 1 : 0,
          transform: [{ translateY: showStickyHeader ? 0 : -STICKY_HEADER_HEIGHT }],
          borderBottomWidth: theme === 'dark' ? 0 : 1, // No border in dark mode
          borderBottomColor: 'rgba(0,0,0,0.05)',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === 'dark' ? 0 : 0.05, // No shadow in dark mode
          shadowRadius: 3,
          elevation: theme === 'dark' ? 0 : 3, // No elevation in dark mode
        }
      ]}
      pointerEvents={showStickyHeader ? 'auto' : 'none'}
    >
      <StatusBar style={showStickyHeader && theme !== 'dark' ? 'dark' : 'light'} />
      <View style={styles.stickyTopBar}>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={[styles.profileButton, { borderColor: activeColors.border, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
        >
          {user?.avatar ? (
            <Image
              source={{ uri: getImageUrl(user.avatar) || '' }}
              style={styles.profilePic}
            />
          ) : (
            <CircleUser size={30} color={activeColors.text} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}
          onPress={() => router.push('/search')}
        >
          <Search size={18} color={activeColors.text} />
          <Text style={[styles.searchText, { color: activeColors.muted }]}>Search ecosystem...</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/messages')} style={styles.iconBtn}>
          <MessagesSquare size={28} color={activeColors.text} strokeWidth={1.5} />
          {unreadMessages > 0 && (
            <View style={[styles.iOSBadge, { backgroundColor: '#FF3B30' }]}>
              <Text style={styles.iOSBadgeText}>{unreadMessages}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: '#074B43' }]}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.profileButton}
        >
          {user?.avatar ? (
            <Image
              source={{ uri: getImageUrl(user.avatar) || '' }}
              style={styles.profilePic}
            />
          ) : (
            <CircleUser size={30} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/search')}>
          <Search size={18} color="#074B43" />
          <Text style={styles.searchText}>Search ecosystem...</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/messages')} style={styles.iconBtn}>
          <MessagesSquare size={28} color="#fff" strokeWidth={1.5} />
          {unreadMessages > 0 && (
            <View style={[styles.iOSBadge, { backgroundColor: '#FF3B30' }]}>
              <Text style={styles.iOSBadgeText}>{unreadMessages}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.createCard, { backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.05)' }]}>
        <View style={styles.createTop}>
          <Image
            source={user?.avatar ? { uri: getImageUrl(user.avatar) } : require('../../assets/images/icon.png')}
            style={styles.createAvatar}
          />
          <TouchableOpacity
            style={[styles.createButtonTrigger, { backgroundColor: '#F3F4F6' }]}
            onPress={() => router.push('/modal')}
          >
            <Text style={[styles.createPlaceholder, { color: '#6B7280' }]}>Share your next breakthrough...</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.createDivider, { backgroundColor: '#F3F4F6' }]} />
        <View style={styles.createActions}>
          <TouchableOpacity style={styles.createActionItem} onPress={() => router.push('/modal')}>
            <ImageIcon size={18} color="#3B82F6" />
            <Text style={[styles.createActionText, { color: '#4B5563' }]}>Media</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createActionItem} onPress={() => router.push('/modal')}>
            <Calendar size={18} color="#F59E0B" />
            <Text style={[styles.createActionText, { color: '#4B5563' }]}>Event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createActionItem} onPress={() => router.push('/modal')}>
            <FileText size={18} color="#10B981" />
            <Text style={[styles.createActionText, { color: '#4B5563' }]}>Article</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Explore Innovation</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <SlidersHorizontal size={22} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSideMenu = () => (
    <Modal visible={menuVisible} animationType="fade" transparent onRequestClose={() => setMenuVisible(false)}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setMenuVisible(false)}>
        <View style={[styles.sideMenuContainer, { backgroundColor: activeColors.card }]}>
          <View style={styles.sideMenuHeader}>
            <Image
              source={{ uri: getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=A5D6B7&color=fff` }}
              style={styles.sideMenuAvatar}
            />
            <View style={styles.sideMenuUserInfo}>
              <Text style={[styles.sideMenuName, { color: activeColors.text }]}>{user?.firstName} {user?.lastName}</Text>
              <Text style={[styles.sideMenuHandle, { color: activeColors.muted }]}>@{user?.username || 'username'}</Text>
              <View style={styles.sideMenuStats}>
                <Text style={[styles.sideMenuStatValue, { color: activeColors.text }]}>{connectionCount}</Text>
                <Text style={[styles.sideMenuStatLabel, { color: activeColors.muted }]}>Connections</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.sideMenuContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.sideMenuItem} onPress={() => { setMenuVisible(false); router.push('/profile/details'); }}>
              <CircleUser size={22} color={activeColors.text} />
              <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Profile</Text>
            </TouchableOpacity>

            {/* Analytics Menu Item */}
            <View>
              <TouchableOpacity style={styles.sideMenuItem} onPress={() => setShowAnalyticsMenu(!showAnalyticsMenu)}>
                <BarChart2 size={22} color={activeColors.text} />
                <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Analytics</Text>
                <ChevronDown size={20} color={activeColors.muted} style={{ marginLeft: 'auto', transform: [{ rotate: showAnalyticsMenu ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
              {showAnalyticsMenu && (
                <View style={{ paddingLeft: 54, paddingBottom: 12, gap: 12 }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: activeColors.text }}>{analytics.profileViews}</Text>
                    <Text style={{ fontSize: 13, color: activeColors.muted }}>Profile views</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: activeColors.text }}>{analytics.postImpressions}</Text>
                    <Text style={{ fontSize: 13, color: activeColors.muted }}>Post impressions</Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.sideMenuItem} onPress={() => setMenuVisible(false)}>
              <Sparkles size={22} color={activeColors.text} />
              <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Feeds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideMenuItem} onPress={() => setMenuVisible(false)}>
              <Bookmark size={22} color={activeColors.text} />
              <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Bookmarks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideMenuItem} onPress={() => setMenuVisible(false)}>
              <Ban size={22} color={activeColors.text} />
              <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Blocks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideMenuItem} onPress={() => setMenuVisible(false)}>
              <VolumeX size={22} color={activeColors.text} />
              <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Mutes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideMenuItem} onPress={() => { setMenuVisible(false); router.push('/edit-profile'); }}>
              <Settings size={22} color={activeColors.text} />
              <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideMenuItem} onPress={() => setMenuVisible(false)}>
              <HelpCircle size={22} color={activeColors.text} />
              <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Help Center</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={{ borderTopWidth: 1, borderTopColor: activeColors.border }}>
            <TouchableOpacity
              style={[styles.sideMenuFooter, { borderTopWidth: 0 }]}
              onPress={() => setShowAccountsMenu(!showAccountsMenu)}
            >
              <Text style={[styles.sideMenuFooterText, { color: activeColors.text }]}>Manage Accounts</Text>
              <ChevronDown size={20} color={activeColors.muted} style={{ transform: [{ rotate: showAccountsMenu ? '180deg' : '0deg' }] }} />
            </TouchableOpacity>

            {showAccountsMenu && (
              <View style={{ paddingBottom: 16 }}>
                <TouchableOpacity style={styles.sideMenuItem} onPress={() => { setMenuVisible(false); router.push('/(auth)/register'); }}>
                  <UserPlus size={22} color={activeColors.text} />
                  <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Create a new account</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sideMenuItem} onPress={() => { setMenuVisible(false); router.push('/(auth)/login'); }}>
                  <Plus size={22} color={activeColors.text} />
                  <Text style={[styles.sideMenuText, { color: activeColors.text }]}>Add an existing account</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sideMenuItem} onPress={async () => {
                  await logout();
                  router.replace('/(auth)/login');
                }}>
                  <LogOut size={22} color="#ef4444" />
                  <Text style={[styles.sideMenuText, { color: '#ef4444' }]}>Log out @{user?.username}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      {/* Sticky Header */}
      {renderStickyHeader()}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onBookmark={handleBookmark}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
                source={user?.avatar ? { uri: getImageUrl(user.avatar) } : require('../../assets/images/icon.png')}
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

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setFilterModalVisible(false)}
          />
          <View style={[styles.filterModal, { backgroundColor: activeColors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: activeColors.border }]}>
              <Text style={[styles.modalTitle, { color: activeColors.text }]}>Filter Innovation</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X size={24} color={activeColors.muted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[{ key: 'filters' }]}
              renderItem={() => (
                <View>
                  <Text style={[styles.filterLabel, { color: activeColors.text }]}>Category</Text>
                  <View style={styles.filterGrid}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor: selectedCategory === cat.id ? activeColors.tint : activeColors.background,
                            borderColor: selectedCategory === cat.id ? activeColors.tint : activeColors.border,
                          }
                        ]}
                        onPress={() => {
                          setSelectedCategory(cat.id);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <cat.icon
                            size={16}
                            color={selectedCategory === cat.id ? '#fff' : activeColors.text}
                          />
                          <Text style={[
                            styles.filterChipText,
                            { color: selectedCategory === cat.id ? '#fff' : activeColors.text }
                          ]}>
                            {cat.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.filterLabel, { color: activeColors.text, marginTop: 24 }]}>Project Stage</Text>
                  <View style={styles.filterGrid}>
                    {stages.map((stage) => (
                      <TouchableOpacity
                        key={stage.id}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor: selectedStage === stage.id ? activeColors.tint : activeColors.background,
                            borderColor: selectedStage === stage.id ? activeColors.tint : activeColors.border,
                          }
                        ]}
                        onPress={() => {
                          setSelectedStage(stage.id);
                        }}
                      >
                        <Text style={[
                          styles.filterChipText,
                          { color: selectedStage === stage.id ? '#fff' : activeColors.text }
                        ]}>
                          {stage.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.key}
              contentContainerStyle={{ paddingBottom: 40 }}
            />

            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: activeColors.tint }]}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {renderSideMenu()}
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
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  stickyTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    minHeight: SCREEN_HEIGHT * 0.42,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  searchText: {
    fontSize: 14,
    color: '#074B43',
    fontWeight: '500',
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
    borderColor: '#074B43',
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
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
  filterModal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    height: '85%',
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  // Side Menu Styles
  sideMenuContainer: { width: '80%', height: '100%', backgroundColor: '#fff', paddingVertical: 40, paddingHorizontal: 24, paddingBottom: 20 },
  sideMenuHeader: { marginBottom: 30 },
  sideMenuAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 12 },
  sideMenuUserInfo: { marginBottom: 16 },
  sideMenuName: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  sideMenuHandle: { fontSize: 15 },
  sideMenuStats: { flexDirection: 'row', alignItems: 'center' },
  sideMenuStatValue: { fontWeight: '700', fontSize: 15, marginRight: 4 },
  sideMenuStatLabel: { fontSize: 15 },
  sideMenuContent: { flex: 1 },
  sideMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 16 },
  sideMenuText: { fontSize: 18, fontWeight: '600' },
  sideMenuFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderTopWidth: 1 },
  sideMenuFooterText: { fontSize: 16, fontWeight: '600' },
});
