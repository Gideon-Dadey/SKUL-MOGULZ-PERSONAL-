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
import { useRouter, Stack } from 'expo-router';
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
                api.get(`/network/search?q=${encodeURIComponent(searchQuery)}`).catch(() => ({ data: [] })),
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
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: '#074B43', paddingTop: insets.top + 10 }]}>
                <View style={styles.searchContainer}>
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
                            selectionColor="#074B43"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={18} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Integrated Tabs in Header */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'all' ? '#fff' : 'rgba(255,255,255,0.7)' }]}>
                            All
                        </Text>
                        {activeTab === 'all' && <View style={styles.activeTabIndicator} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                        onPress={() => setActiveTab('users')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'users' ? '#fff' : 'rgba(255,255,255,0.7)' }]}>
                            People
                        </Text>
                        {activeTab === 'users' && <View style={styles.activeTabIndicator} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
                        onPress={() => setActiveTab('projects')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'projects' ? '#fff' : 'rgba(255,255,255,0.7)' }]}>
                            Projects
                        </Text>
                        {activeTab === 'projects' && <View style={styles.activeTabIndicator} />}
                    </TouchableOpacity>
                </View>
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
        paddingBottom: 0,
        gap: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    backBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 24,
        paddingHorizontal: 16,
        gap: 10,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#074B43',
        fontWeight: '500',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    activeTab: {
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '40%',
        height: 3,
        backgroundColor: '#fff',
        borderRadius: 1.5,
    },
    tabText: {
        fontSize: 15,
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
