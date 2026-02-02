
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, TrendingUp, Sparkles, Users, LayoutGrid, ArrowUpRight, Crown, Swords, Lightbulb } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import api from '../../services/api';
import {
    TrendingTopicCard,
    ProjectCard,
    GroupCard,
    LeaderboardItem,
    ChallengeCard,
    BuildImpossibleHero
} from '../../components/ProjectComponents';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const TRENDING_TOPICS = ['AIInnovation', 'CampusStartups', 'FintechRevolution', 'GreenEnergy', 'EdTech2026'];





export default function ProjectsScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const activeColors = Colors[theme];

    const [trendingProjects, setTrendingProjects] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [activeTopic, setActiveTopic] = useState('AIInnovation');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTrendingContent = async () => {
        setIsLoading(true);
        try {
            const [projRes, leadRes] = await Promise.all([
                api.get('/projects', { params: { search: activeTopic } }),
                api.get('/analytics/leaderboard')
            ]);

            // Filter to only original projects (not reposts)
            const originalProjects = projRes.data.filter((p: any) => !p.repostOf);

            if (originalProjects.length < 3) {
                const allResponse = await api.get('/projects');
                const allOriginals = allResponse.data.filter((p: any) => !p.repostOf);
                setTrendingProjects(allOriginals.slice(0, 10));
            } else {
                setTrendingProjects(originalProjects);
            }

            setLeaderboard(leadRes.data);
        } catch (error) {
            console.error('Failed to fetch arena content', error);
            try {
                const fallback = await api.get('/projects');
                const fallbackOriginals = fallback.data.filter((p: any) => !p.repostOf);
                setTrendingProjects(fallbackOriginals.slice(0, 5));
            } catch (e) { }
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTrendingContent();
    }, [activeTopic]);

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

            {/* Dynamic Modern Header */}
            <View style={[styles.header, { borderBottomColor: activeColors.border }]}>
                <View>
                    <Text style={[styles.greeting, { color: activeColors.muted }]}>Build the impossible</Text>
                    <Text style={[styles.title, { color: activeColors.text }]}>The Arena</Text>
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

                {/* The Ignition Phase: Build the Impossible */}
                <BuildImpossibleHero onPress={() => router.push('/modal')} />

                {/* Global Standings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleGroup}>
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Hall of Builders</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/leaderboard')}>
                            <Text style={[styles.seeAllText, { color: activeColors.muted }]}>Full Rankings</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.leaderboardBox, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: activeColors.border + '50', borderWidth: 1 }]}>
                        {leaderboard.slice(0, 5).map((mogul, idx) => (
                            <LeaderboardItem key={mogul._id || mogul.id} mogul={{
                                id: mogul._id || mogul.id,
                                name: `${mogul.firstName} ${mogul.lastName}`,
                                handle: mogul.username || mogul.firstName.toLowerCase(),
                                points: mogul.points || 0,
                                avatar: mogul.avatar
                            }} rank={idx + 1} />
                        ))}
                    </View>
                </View>

                {/* Trending Topics */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleGroup}>
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Viral Echoes</Text>
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
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Breakthroughs</Text>
                        </View>
                        <TouchableOpacity style={styles.seeAllBtn}>
                            <Text style={[styles.seeAllText, { color: activeColors.tint }]}>Discover</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsScroll}>
                        {trendingProjects.map(project => (
                            <ProjectCard key={project._id || project.id} project={project} />
                        ))}
                    </ScrollView>
                </View>



                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Launch Button */}
            <TouchableOpacity
                style={[styles.floatingBtn, { backgroundColor: activeColors.tint }]}
                onPress={() => router.push('/modal')}
            >
                <Text style={styles.floatingBtnText}>New Idea</Text>
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
        letterSpacing: -1,
    },
    searchCircle: {
        width: 48,
        height: 48,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: 24,
    },
    section: {
        marginBottom: 40,
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
        gap: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
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
    leaderboardBox: {
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(150,150,150,0.05)',
    },
    floatingBtn: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 10,
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
});
