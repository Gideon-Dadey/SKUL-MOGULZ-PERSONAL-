import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ArrowLeft, X, Users, Briefcase } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';
import api, { getImageUrl } from '../services/api';

export default function SearchScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const activeColors = Colors[theme];

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ users: any[]; projects: any[] }>({
        users: [],
        projects: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'users' | 'projects'>('all');

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                performSearch();
            } else {
                setSearchResults({ users: [], projects: [] });
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const performSearch = async () => {
        try {
            setIsLoading(true);
            const [usersRes, projectsRes] = await Promise.all([
                api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`).catch(() => ({ data: [] })),
                api.get(`/projects?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ data: [] })),
            ]);

            setSearchResults({
                users: usersRes.data || [],
                projects: projectsRes.data || [],
            });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.resultItem, { backgroundColor: activeColors.card }]}
            onPress={() => router.push(`/profile/${item._id || item.id}`)}
        >
            <Image
                source={item.avatar ? { uri: getImageUrl(item.avatar) } : require('../assets/images/icon.png')}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: activeColors.text }]}>
                    {item.firstName} {item.lastName}
                </Text>
                <Text style={[styles.userRole, { color: activeColors.muted }]}>
                    {item.role || 'Member'}
                </Text>
            </View>
            <Users size={20} color={activeColors.muted} />
        </TouchableOpacity>
    );

    const renderProjectItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.resultItem, { backgroundColor: activeColors.card }]}
            onPress={() => router.push({ pathname: '/projects', params: { projectId: item._id || item.id } })}
        >
            {item.image && getImageUrl(item.image) ? (
                <Image source={{ uri: getImageUrl(item.image) || undefined }} style={styles.projectImage} />
            ) : (
                <View style={[styles.projectImagePlaceholder, { backgroundColor: activeColors.background }]}>
                    <Briefcase size={24} color={activeColors.muted} />
                </View>
            )}
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: activeColors.text }]} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={[styles.userRole, { color: activeColors.muted }]} numberOfLines={1}>
                    {item.category || 'Project'} • {item.stage || 'Idea'}
                </Text>
            </View>
            <Briefcase size={20} color={activeColors.muted} />
        </TouchableOpacity>
    );

    const getFilteredResults = () => {
        if (activeTab === 'users') return searchResults.users;
        if (activeTab === 'projects') return searchResults.projects;
        return [...searchResults.users, ...searchResults.projects];
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        // Determine if it's a user or project based on properties
        const isUser = item.firstName || item.lastName || item.email;
        if (isUser) {
            return renderUserItem({ item });
        }
        return renderProjectItem({ item });
    };

    const totalResults = searchResults.users.length + searchResults.projects.length;

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: '#074B43', paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.searchInputContainer}>
                    <Search size={18} color="#074B43" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search ecosystem..."
                        placeholderTextColor="#6B7280"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={18} color="#6B7280" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Tabs */}
            <View style={[styles.tabs, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'all' ? '#074B43' : activeColors.muted }]}>
                        All ({totalResults})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                    onPress={() => setActiveTab('users')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'users' ? '#074B43' : activeColors.muted }]}>
                        People ({searchResults.users.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
                    onPress={() => setActiveTab('projects')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'projects' ? '#074B43' : activeColors.muted }]}>
                        Projects ({searchResults.projects.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Results */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : searchQuery.length < 2 ? (
                <View style={styles.emptyContainer}>
                    <Search size={48} color={activeColors.muted} />
                    <Text style={[styles.emptyTitle, { color: activeColors.text }]}>
                        Search the Ecosystem
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: activeColors.muted }]}>
                        Find people, projects, and opportunities
                    </Text>
                </View>
            ) : getFilteredResults().length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyTitle, { color: activeColors.text }]}>
                        No results found
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: activeColors.muted }]}>
                        Try different keywords or filters
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={getFilteredResults()}
                    keyExtractor={(item, index) => (item._id || item.id || index).toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.resultsList}
                    showsVerticalScrollIndicator={false}
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
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    backBtn: {
        padding: 4,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 16,
        gap: 10,
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#074B43',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    resultsList: {
        padding: 16,
        gap: 12,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    projectImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    projectImagePlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    userRole: {
        fontSize: 13,
    },
});
