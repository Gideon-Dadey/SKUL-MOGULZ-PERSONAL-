
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, TrendingUp, Sparkles, Users, LayoutGrid, ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import api from '../../services/api';
import { TrendingTopicCard, ProjectCard, GroupCard } from '../../components/ProjectComponents';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const TRENDING_TOPICS = ['AIInnovation', 'CampusStartups', 'FintechRevolution', 'GreenEnergy', 'EdTech2026'];

const SAMPLE_GROUPS = [
    { id: '1', name: 'MIT Builders', members: 420, icon: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=100&h=100&fit=crop' },
    { id: '2', name: 'Female Founders', members: 1250, icon: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop' },
    { id: '3', name: 'Venture Capital', members: 890, icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop' },
];

export default function ProjectsScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const activeColors = Colors[theme];

    const [trendingProjects, setTrendingProjects] = useState<any[]>([]);
    const [activeTopic, setActiveTopic] = useState('AIInnovation');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchTrendingContent();
    }, []);

    const fetchTrendingContent = async () => {
        try {
            const response = await api.get('/projects');
            // Sort by likes or recent for "Trending" feel
            const trending = response.data.sort((a: any, b: any) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 5);
            setTrendingProjects(trending);
        } catch (error) {
            console.error('Failed to fetch trending projects', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTrendingContent();
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: activeColors.background }]}>
                <ActivityIndicator size="large" color={activeColors.tint} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            {/* Header Area */}
            <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
                <View>
                    <Text style={[styles.greeting, { color: activeColors.muted }]}>Explore the future</Text>
                    <Text style={[styles.title, { color: activeColors.text }]}>Innovation Hub</Text>
                </View>
                <TouchableOpacity
                    style={[styles.searchCircle, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
                    onPress={() => router.push('/search')}
                >
                    <Search size={22} color={activeColors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColors.tint} />}
                contentContainerStyle={styles.scrollContent}
            >

                {/* Trending Topics Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleGroup}>
                            <TrendingUp size={20} color={activeColors.tint} />
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Trending Topics</Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicsScroll}>
                        {TRENDING_TOPICS.map(topic => (
                            <TrendingTopicCard
                                key={topic}
                                topic={topic}
                                isActive={activeTopic === topic}
                                onPress={() => setActiveTopic(topic)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Featured Projects Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleGroup}>
                            <Sparkles size={20} color="#F59E0B" />
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Featured Breakthroughs</Text>
                        </View>
                        <TouchableOpacity style={styles.seeAllBtn}>
                            <Text style={[styles.seeAllText, { color: activeColors.tint }]}>See all</Text>
                            <ArrowUpRight size={14} color={activeColors.tint} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsScroll}>
                        {trendingProjects.map(project => (
                            <ProjectCard key={project._id || project.id} project={project} />
                        ))}
                        {trendingProjects.length === 0 && (
                            <View style={[styles.emptyBox, { backgroundColor: activeColors.card }]}>
                                <Text style={{ color: activeColors.muted }}>No breakthrough projects found. Be the first!</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Groups / Ecosystem Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleGroup}>
                            <Users size={20} color="#3B82F6" />
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Power Ecosystems</Text>
                        </View>
                    </View>
                    <View style={styles.groupsContainer}>
                        {SAMPLE_GROUPS.map(group => (
                            <GroupCard key={group.id} group={group} />
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Create Button */}
            <TouchableOpacity
                style={[styles.floatingBtn, { backgroundColor: activeColors.tint }]}
                onPress={() => router.push('/modal')}
            >
                <Plus size={28} color="#fff" />
                <Text style={styles.floatingBtnText}>Launch</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    searchCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '700',
    },
    topicsScroll: {
        paddingLeft: 24,
    },
    projectsScroll: {
        paddingLeft: 24,
        paddingRight: 8,
    },
    groupsContainer: {
        paddingHorizontal: 24,
    },
    floatingBtn: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    floatingBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    emptyBox: {
        width: width - 48,
        height: 140,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginLeft: 24,
    }
});
