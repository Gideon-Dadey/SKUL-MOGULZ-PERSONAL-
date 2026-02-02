
import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ExternalLink, Users, TrendingUp, Crown, Zap, Target, ArrowRight, Lightbulb } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../services/api';

const { width } = Dimensions.get('window');

interface Project {
    id: string;
    title: string;
    category: string;
    projectStage: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    media?: string[];
    likes?: number;
    membersCount?: number;
}

export const TrendingTopicCard = ({ topic, isActive, onPress }: { topic: string, isActive: boolean, onPress: () => void }) => {
    const { theme } = useTheme();
    const activeColors = Colors[theme];
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.topicCard,
                { backgroundColor: isActive ? activeColors.tint : activeColors.card, borderColor: activeColors.border }
            ]}
        >
            <Text style={[styles.topicText, { color: isActive ? '#fff' : activeColors.text }]}>#{topic}</Text>
        </TouchableOpacity>
    );
};

export const ProjectCard = ({ project }: { project: any }) => {
    const { theme } = useTheme();
    const activeColors = Colors[theme];
    const router = useRouter();

    const likesCount = Array.isArray(project.likes) ? project.likes.length : (project.likes || 0);

    return (
        <TouchableOpacity
            style={[styles.projectCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
            onPress={() => router.push(`/post/${project._id || project.id}`)}
        >
            <Image
                source={project.media?.[0] ? { uri: getImageUrl(project.media[0]) || '' } : require('../assets/images/icon.png')}
                style={styles.projectImage}
            />
            <View style={styles.projectContent}>
                <View style={styles.projectHeader}>
                    <Text style={[styles.projectCategory, { color: activeColors.tint }]}>{project.category?.toUpperCase() || 'GENERAL'}</Text>
                    <View style={[styles.stageBadge, { backgroundColor: activeColors.background }]}>
                        <Text style={[styles.stageText, { color: activeColors.muted }]}>{project.projectStage}</Text>
                    </View>
                </View>
                <Text style={[styles.projectTitle, { color: activeColors.text }]} numberOfLines={1}>{project.title}</Text>

                <View style={styles.projectFooter}>
                    <View style={styles.authorGroup}>
                        <Image
                            source={project.author?.avatar ? { uri: getImageUrl(project.author.avatar) || '' } : { uri: `https://ui-avatars.com/api/?name=${project.author?.firstName || 'M'}&background=D1FAE5&color=065F46` }}
                            style={styles.authorAvatar}
                        />
                        <Text style={[styles.authorName, { color: activeColors.text }]}>{project.author?.firstName || 'Mogul'}</Text>
                    </View>
                    <View style={styles.statsGroup}>
                        <Text style={[styles.statsText, { color: activeColors.muted }]}>{likesCount} moguls</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const GroupCard = ({ group }: { group: any }) => {
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    return (
        <TouchableOpacity style={[styles.groupCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.groupIconContainer}>
                <Image
                    source={group.icon ? { uri: group.icon } : require('../assets/images/icon.png')}
                    style={styles.groupIcon}
                />
            </View>
            <View style={styles.groupInfo}>
                <Text style={[styles.groupName, { color: activeColors.text }]} numberOfLines={1}>{group.name}</Text>
                <Text style={[styles.groupMembers, { color: activeColors.muted }]}>{group.members} active moguls</Text>
            </View>
            <TouchableOpacity style={[styles.joinBtn, { backgroundColor: activeColors.tint + '20' }]}>
                <Text style={[styles.joinText, { color: activeColors.tint }]}>Join</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export const LeaderboardItem = ({ mogul, rank }: { mogul: any, rank: number }) => {
    const { theme } = useTheme();
    const activeColors = Colors[theme];
    const router = useRouter();

    return (
        <TouchableOpacity
            style={[styles.leaderboardItem, { borderBottomColor: activeColors.border + '50' }]}
            onPress={() => router.push(`/profile/${mogul.id || mogul._id}`)}
        >
            <View style={styles.rankContainer}>
                <Text style={[styles.rankText, { color: rank === 1 ? '#FBBF24' : activeColors.muted }]}>{rank}</Text>
            </View>
            <Image
                source={mogul.avatar ? { uri: getImageUrl(mogul.avatar) || '' } : { uri: `https://ui-avatars.com/api/?name=${mogul.name}&background=F3F4F6&color=374151` }}
                style={styles.leaderAvatar}
            />
            <View style={styles.leaderInfo}>
                <Text style={[styles.leaderName, { color: activeColors.text }]}>{mogul.name}</Text>
                <Text style={[styles.leaderHandle, { color: activeColors.muted }]}>@{mogul.handle}</Text>
            </View>
            <View style={[styles.pointsGroup, { backgroundColor: activeColors.tint + '10' }]}>
                <Text style={[styles.pointsText, { color: activeColors.tint }]}>{mogul.points.toLocaleString()} XP</Text>
            </View>
        </TouchableOpacity>
    );
};

export const ChallengeCard = ({ challenge }: { challenge: any }) => {
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    return (
        <TouchableOpacity style={[styles.challengeCard, { backgroundColor: activeColors.card, borderColor: activeColors.tint + '40' }]}>
            <View style={styles.challengeHeader}>
                <View style={[styles.bountyBadge, { backgroundColor: activeColors.tint }]}>
                    <Text style={styles.bountyText}>BOUNTY: {challenge.bounty}</Text>
                </View>
            </View>
            <Text style={[styles.challengeTitle, { color: activeColors.text }]}>{challenge.title}</Text>
            <Text style={[styles.challengeDesc, { color: activeColors.muted }]} numberOfLines={2}>{challenge.description}</Text>
            <View style={styles.challengeFooter}>
                <Text style={[styles.timeLeft, { color: '#EF4444' }]}>{challenge.timeLeft} left</Text>
                <View style={styles.participateBtn}>
                    <Text style={[styles.participateText, { color: activeColors.tint }]}>Join Arena</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};



export const BuildImpossibleHero = ({ onPress }: { onPress: () => void }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.heroContainer}
            onPress={onPress}
        >
            <View style={StyleSheet.absoluteFill}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&fit=crop' }}
                    style={styles.heroBgImage}
                />
                <View style={[styles.heroOverlay, { backgroundColor: theme === 'dark' ? 'rgba(5, 5, 5, 0.75)' : 'rgba(255, 255, 255, 0.6)' }]} />
            </View>

            <View style={styles.heroContent}>
                <Text style={[styles.heroTitle, { color: theme === 'dark' ? '#fff' : '#050505' }]}>
                    BUILD THE{"\n"}
                    <Text style={{ color: '#A5D6B7' }}>IMPOSSIBLE</Text>
                </Text>
                <Text style={[styles.heroSubtitle, { color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                    Your next breakthrough starts here. Turn your wildest campus ideas into reality.
                </Text>

                <View style={styles.heroActionBtn}>
                    <Text style={[styles.heroActionText, { color: theme === 'dark' ? '#fff' : '#050505' }]}>Ship Today</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    topicCard: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        marginRight: 8,
    },
    topicText: {
        fontWeight: '700',
        fontSize: 14,
    },
    projectCard: {
        width: width * 0.7,
        borderRadius: 10,
        borderWidth: 1,
        marginRight: 16,
        overflow: 'hidden',
    },
    projectImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#eee',
    },
    projectContent: {
        padding: 16,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    projectCategory: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    stageBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    stageText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    projectFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    authorAvatar: {
        width: 24,
        height: 24,
        borderRadius: 10,
    },
    authorName: {
        fontSize: 12,
        fontWeight: '600',
    },
    statsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statsText: {
        fontSize: 12,
        fontWeight: '700',
    },
    groupCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
    },
    groupIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
    },
    groupIcon: {
        width: '100%',
        height: '100%',
    },
    groupInfo: {
        flex: 1,
        marginLeft: 12,
    },
    groupName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    groupMembers: {
        fontSize: 13,
        fontWeight: '500',
    },
    joinBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    joinText: {
        fontWeight: '800',
        fontSize: 14,
    },
    // New Creative Styles
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    rankContainer: {
        width: 30,
        alignItems: 'center',
    },
    rankText: {
        fontWeight: '800',
        fontSize: 16,
    },
    leaderAvatar: {
        width: 40,
        height: 40,
        borderRadius: 10,
    },
    leaderInfo: {
        flex: 1,
    },
    leaderName: {
        fontSize: 15,
        fontWeight: '700',
    },
    leaderHandle: {
        fontSize: 12,
        fontWeight: '500',
    },
    pointsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(165,214,183,0.1)',
    },
    pointsText: {
        fontSize: 13,
        fontWeight: '800',
    },
    challengeCard: {
        width: width * 0.8,
        borderRadius: 10,
        borderWidth: 1,
        padding: 20,
        marginRight: 16,
    },
    challengeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    bountyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    bountyText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
    },
    challengeTitle: {
        fontSize: 19,
        fontWeight: '900',
        marginBottom: 8,
    },
    challengeDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    challengeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeLeft: {
        fontSize: 12,
        fontWeight: '700',
    },
    participateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    participateText: {
        fontSize: 13,
        fontWeight: '800',
    },
    sparkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
        marginHorizontal: 24,
        marginBottom: 32,
        gap: 16,
    },
    sparkIconBox: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sparkContent: {
        flex: 1,
    },
    sparkTitle: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    sparkDesc: {
        fontSize: 16,
        fontWeight: '600',
    },
    sparkAction: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#A5D6B7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Hero Styles
    heroContainer: {
        marginHorizontal: 24,
        height: 220,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 32,
        justifyContent: 'flex-end',
        elevation: 10,
        shadowColor: '#A5D6B7',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    heroBgImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    heroContent: {
        padding: 24,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    heroBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 34,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
        marginBottom: 20,
    },
    heroActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    heroActionText: {
        fontSize: 14,
        fontWeight: '800',
    },
});
