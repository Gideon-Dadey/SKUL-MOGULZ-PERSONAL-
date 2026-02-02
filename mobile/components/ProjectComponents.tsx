
import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ExternalLink, Users, TrendingUp } from 'lucide-react-native';
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

    return (
        <TouchableOpacity style={[styles.projectCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <Image
                source={project.media?.[0] ? { uri: getImageUrl(project.media[0]) } : require('../assets/images/icon.png')}
                style={styles.projectImage}
            />
            <View style={styles.projectContent}>
                <View style={styles.projectHeader}>
                    <Text style={[styles.projectCategory, { color: activeColors.tint }]}>{project.category.toUpperCase()}</Text>
                    <View style={[styles.stageBadge, { backgroundColor: activeColors.background }]}>
                        <Text style={[styles.stageText, { color: activeColors.muted }]}>{project.projectStage}</Text>
                    </View>
                </View>
                <Text style={[styles.projectTitle, { color: activeColors.text }]} numberOfLines={1}>{project.title}</Text>

                <View style={styles.projectFooter}>
                    <View style={styles.authorGroup}>
                        <Image
                            source={project.author?.avatar ? { uri: getImageUrl(project.author.avatar) } : { uri: `https://ui-avatars.com/api/?name=${project.author?.firstName}&background=A5D6B7&color=000` }}
                            style={styles.authorAvatar}
                        />
                        <Text style={[styles.authorName, { color: activeColors.muted }]}>{project.author?.firstName}</Text>
                    </View>
                    <View style={styles.statsGroup}>
                        <Users size={14} color={activeColors.muted} />
                        <Text style={[styles.statsText, { color: activeColors.muted }]}>{project.likes || 0}</Text>
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
            <TouchableOpacity style={[styles.joinBtn, { backgroundColor: activeColors.tint + '15' }]}>
                <Text style={[styles.joinText, { color: activeColors.tint }]}>Join</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    topicCard: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        marginRight: 8,
    },
    topicText: {
        fontWeight: '700',
        fontSize: 14,
    },
    projectCard: {
        width: width * 0.7,
        borderRadius: 20,
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
        borderRadius: 12,
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
        borderRadius: 12,
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
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 12,
    },
    groupIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
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
        borderRadius: 12,
    },
    joinText: {
        fontWeight: '800',
        fontSize: 14,
    },
});
