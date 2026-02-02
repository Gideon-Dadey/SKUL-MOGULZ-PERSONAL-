
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api from '../services/api';
import { LeaderboardItem } from '../components/ProjectComponents';



export default function LeaderboardScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const activeColors = Colors[theme];

    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/analytics/leaderboard');
                setLeaderboard(response.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: activeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={activeColors.tint} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: activeColors.border + '30' }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleGroup}>
                    <Text style={[styles.headerTitle, { color: activeColors.text }]}>Hall of Builders</Text>
                </View>
                <TouchableOpacity>
                    <Info size={22} color={activeColors.muted} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Season Summary Card */}
                <View style={[styles.seasonCard, { backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB', borderColor: activeColors.border + '50' }]}>
                    <View style={styles.seasonInfo}>
                        <Text style={[styles.seasonLabel, { color: activeColors.muted }]}>CURRENT SEASON</Text>
                        <Text style={[styles.seasonTitle, { color: activeColors.text }]}>Winter Innovation '26</Text>
                    </View>
                    <View style={styles.timeGroup}>
                        <Text style={[styles.timeText, { color: activeColors.tint }]}>14 days remaining</Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Global Rankings</Text>

                <View style={[styles.leaderboardBox, { backgroundColor: activeColors.card, borderColor: activeColors.border + '30' }]}>
                    {leaderboard.map((mogul: any, idx: number) => (
                        <LeaderboardItem key={mogul._id || mogul.id} mogul={{
                            id: mogul._id || mogul.id,
                            name: `${mogul.firstName} ${mogul.lastName}`,
                            handle: mogul.username || mogul.firstName.toLowerCase(),
                            points: mogul.points || 0,
                            avatar: mogul.avatar
                        }} rank={idx + 1} />
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <Text style={[styles.infoText, { color: activeColors.muted }]}>
                        Points are earned by launching projects, reaching milestones, and helping other builders in the ecosystem.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    scrollContent: {
        padding: 24,
    },
    seasonCard: {
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    seasonInfo: {
        flex: 1,
    },
    seasonLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    seasonTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    timeGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(165,214,183,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    leaderboardBox: {
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    infoBox: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    infoText: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
        fontStyle: 'italic',
    }
});
