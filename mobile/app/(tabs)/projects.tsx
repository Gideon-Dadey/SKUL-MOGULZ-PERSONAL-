
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
    IdeaSparkCard
} from '../../components/ProjectComponents';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const TRENDING_TOPICS = ['AIInnovation', 'CampusStartups', 'FintechRevolution', 'GreenEnergy', 'EdTech2026'];

const SAMPLE_LEADERBOARD = [
    { id: '1', name: 'Alex Rivera', handle: 'arivera', points: 12400, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { id: '2', name: 'Sarah Chen', handle: 'schen_builds', points: 9800, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: '3', name: 'Marcus Vane', handle: 'mvane', points: 8200, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
];

const SAMPLE_CHALLENGES = [
    { id: '1', title: 'Carbon Zero Tracker', description: 'Build a mobile widget that calculates daily carbon offset from campus commutes.', bounty: '$500', timeLeft: '2d 4h' },
    { id: '2', title: 'AR Campus Map', description: 'Create an AR layer for the campus library to find available study spots in real-time.', bounty: '$1,200', timeLeft: '5d 12h' },
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

    const fetchTrendingContent = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/projects', {
                params: { search: activeTopic }
            });
            if (response.data.length < 3) {
                const allResponse = await api.get('/projects');
                setTrendingProjects(allResponse.data.slice(0, 10));
            } else {
                setTrendingProjects(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch trending projects', error);
            try {
                const fallback = await api.get('/projects');
                setTrendingProjects(fallback.data.slice(0, 5));
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

                {/* Daily Idea Spark - Creativity First */}
                <IdeaSparkCard />

                {/* Competition: The Leaderboard */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleGroup}>
                            <Crown size={20} color="#F59E0B" fill="#F59E0B" />
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Top Innovators</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={[styles.seeAllText, { color: activeColors.tint }]}>Season Stats</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.leaderboardBox}>
                        {SAMPLE_LEADERBOARD.map((mogul, idx) => (
                            <LeaderboardItem key={mogul.id} mogul={mogul} rank={idx + 1} />
                        ))}
                    </View>
                </View>

                {/* Trending Topics */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleGroup}>
                            <TrendingUp size={20} color={activeColors.tint} />
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
                            <Sparkles size={20} color="#F59E0B" />
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Breakthroughs</Text>
                        </View>
                        <TouchableOpacity style={styles.seeAllBtn}>
                            <Text style={[styles.seeAllText, { color: activeColors.tint }]}>Discover</Text>
                            <ArrowUpRight size={14} color={activeColors.tint} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsScroll}>
                        {trendingProjects.map(project => (
                            <ProjectCard key={project._id || project.id} project={project} />
                        ))}
                    </ScrollView>
                </View>

                {/* Competition: Active Challenges */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleGroup}>
                            <Swords size={20} color="#EF4444" />
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Live Bounties</Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsScroll}>
                        {SAMPLE_CHALLENGES.map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
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
                <Plus size={28} color="#fff" />
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
        borderRadius: 24,
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
        borderRadius: 24,
        backgroundColor: 'rgba(150,150,150,0.05)',
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
});
