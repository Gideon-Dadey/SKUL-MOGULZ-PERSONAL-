
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Crown, Zap, TrendingUp, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import { LeaderboardItem } from '../components/ProjectComponents';

const SAMPLE_LEADERBOARD_EXTENDED = [
    { id: '1', name: 'Alex Rivera', handle: 'arivera', points: 12400, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { id: '2', name: 'Sarah Chen', handle: 'schen_builds', points: 9800, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: '3', name: 'Marcus Vane', handle: 'mvane', points: 8200, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    { id: '4', name: 'Elena Rodriguez', handle: 'elena_r', points: 7500, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
    { id: '5', name: 'David Kim', handle: 'dk_dev', points: 6900, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop' },
    { id: '6', name: 'Jordan Hayes', handle: 'jhayes', points: 5800, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
    { id: '7', name: 'Lila Thorne', handle: 'lila_t', points: 4200, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
];

export default function LeaderboardScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const activeColors = Colors[theme];

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: activeColors.border + '30' }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleGroup}>
                    <Crown size={20} color="#FBBF24" />
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
                        <TrendingUp size={16} color={activeColors.tint} />
                        <Text style={[styles.timeText, { color: activeColors.tint }]}>14 days remaining</Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Global Rankings</Text>

                <View style={[styles.leaderboardBox, { backgroundColor: activeColors.card, borderColor: activeColors.border + '30' }]}>
                    {SAMPLE_LEADERBOARD_EXTENDED.map((mogul, idx) => (
                        <LeaderboardItem key={mogul.id} mogul={mogul} rank={idx + 1} />
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
        borderRadius: 0.5,
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
        borderRadius: 0.5,
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
        borderRadius: 0.5,
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
