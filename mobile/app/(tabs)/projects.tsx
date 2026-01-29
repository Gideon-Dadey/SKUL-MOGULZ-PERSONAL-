
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase, TrendingUp, Rocket, Zap, Target, DollarSign, Filter, Grid, List, Search, Plus, BarChart3, Users, Calendar } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';

const { width } = Dimensions.get('window');

const STAGE_CONFIG = [
    { id: 'all', label: 'All', icon: Grid, color: '#6366f1' },
    { id: 'idea', label: 'Idea', icon: Zap, color: '#8b5cf6' },
    { id: 'prototype', label: 'Prototype', icon: Target, color: '#3b82f6' },
    { id: 'mvp', label: 'MVP', icon: Rocket, color: '#10b981' },
    { id: 'growth', label: 'Growth', icon: TrendingUp, color: '#f59e0b' },
    { id: 'scaling', label: 'Scaling', icon: DollarSign, color: '#ef4444' },
];

const VIEW_MODES = {
    GRID: 'grid',
    LIST: 'list',
};

export default function ProjectsScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const activeColors = Colors[theme];

    const [projects, setProjects] = useState<any[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
    const [selectedStage, setSelectedStage] = useState('all');
    const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        funding: 0,
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        filterProjects();
    }, [projects, selectedStage]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            const userProjects = response.data.filter((p: any) => p.author._id === user?.id || p.author.id === user?.id);

            setProjects(userProjects);
            calculateStats(userProjects);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const calculateStats = (projectList: any[]) => {
        const total = projectList.length;
        const active = projectList.filter(p => ['idea', 'prototype', 'mvp'].includes(p.projectStage)).length;
        const completed = projectList.filter(p => ['growth', 'scaling'].includes(p.projectStage)).length;
        const funding = projectList.reduce((sum, p) => sum + (p.currentFunding || 0), 0);

        setStats({ total, active, completed, funding });
    };

    const filterProjects = () => {
        if (selectedStage === 'all') {
            setFilteredProjects(projects);
        } else {
            setFilteredProjects(projects.filter(p => p.projectStage === selectedStage));
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProjects();
    };

    const getStageColor = (stage: string) => {
        return STAGE_CONFIG.find(s => s.id === stage)?.color || '#666';
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
        return `$${amount}`;
    };

    const renderStatCard = (icon: any, label: string, value: string | number, color: string) => {
        const Icon = icon;
        return (
            <View style={[styles.statCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
                    <Icon size={20} color={color} />
                </View>
                <Text style={[styles.statValue, { color: activeColors.text }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: activeColors.muted }]}>{label}</Text>
            </View>
        );
    };

    const renderProjectCard = (project: any) => {
        const fundingProgress = project.fundingGoal ? (project.currentFunding / project.fundingGoal) * 100 : 0;

        if (viewMode === VIEW_MODES.LIST) {
            return (
                <TouchableOpacity
                    key={project.id || project._id}
                    style={[styles.listCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
                    activeOpacity={0.7}
                >
                    <View style={styles.listCardContent}>
                        <View style={styles.listCardLeft}>
                            {project.media?.[0] ? (
                                <Image source={{ uri: getImageUrl(project.media[0]) || '' }} style={styles.listCardImage} />
                            ) : (
                                <View style={[styles.listCardImagePlaceholder, { backgroundColor: `${getStageColor(project.projectStage)}20` }]}>
                                    <Briefcase size={24} color={getStageColor(project.projectStage)} />
                                </View>
                            )}
                            <View style={styles.listCardInfo}>
                                <Text style={[styles.listCardTitle, { color: activeColors.text }]} numberOfLines={1}>
                                    {project.title}
                                </Text>
                                <Text style={[styles.listCardCategory, { color: activeColors.muted }]} numberOfLines={1}>
                                    {project.category}
                                </Text>
                                <View style={styles.listCardMeta}>
                                    <View style={[styles.stagePill, { backgroundColor: `${getStageColor(project.projectStage)}20` }]}>
                                        <Text style={[styles.stagePillText, { color: getStageColor(project.projectStage) }]}>
                                            {project.projectStage}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {project.fundingGoal > 0 && (
                            <View style={styles.listCardRight}>
                                <Text style={[styles.fundingAmount, { color: activeColors.tint }]}>
                                    {formatCurrency(project.currentFunding)}
                                </Text>
                                <Text style={[styles.fundingGoal, { color: activeColors.muted }]}>
                                    of {formatCurrency(project.fundingGoal)}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            );
        }

        // Grid view
        return (
            <TouchableOpacity
                key={project.id || project._id}
                style={[styles.gridCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
                activeOpacity={0.7}
            >
                {project.media?.[0] ? (
                    <Image source={{ uri: getImageUrl(project.media[0]) || '' }} style={styles.gridCardImage} />
                ) : (
                    <View style={[styles.gridCardImagePlaceholder, { backgroundColor: `${getStageColor(project.projectStage)}20` }]}>
                        <Briefcase size={32} color={getStageColor(project.projectStage)} />
                    </View>
                )}

                <View style={styles.gridCardContent}>
                    <View style={[styles.stageBadge, { backgroundColor: `${getStageColor(project.projectStage)}20` }]}>
                        <Text style={[styles.stageBadgeText, { color: getStageColor(project.projectStage) }]}>
                            {project.projectStage}
                        </Text>
                    </View>

                    <Text style={[styles.gridCardTitle, { color: activeColors.text }]} numberOfLines={2}>
                        {project.title}
                    </Text>

                    <Text style={[styles.gridCardCategory, { color: activeColors.muted }]} numberOfLines={1}>
                        {project.category}
                    </Text>

                    {project.fundingGoal > 0 && (
                        <View style={styles.fundingContainer}>
                            <View style={styles.fundingInfo}>
                                <Text style={[styles.fundingLabel, { color: activeColors.muted }]}>Raised</Text>
                                <Text style={[styles.fundingValue, { color: activeColors.tint }]}>
                                    {formatCurrency(project.currentFunding)}
                                </Text>
                            </View>
                            <View style={[styles.progressBarBg, { backgroundColor: activeColors.border }]}>
                                <View
                                    style={[styles.progressBarFill, {
                                        width: `${Math.min(fundingProgress, 100)}%`,
                                        backgroundColor: getStageColor(project.projectStage)
                                    }]}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.gridCardFooter}>
                        <View style={styles.statsRow}>
                            <Users size={14} color={activeColors.muted} />
                            <Text style={[styles.statsText, { color: activeColors.muted }]}>
                                {project.likes || 0}
                            </Text>
                        </View>
                        <View style={styles.statsRow}>
                            <Calendar size={14} color={activeColors.muted} />
                            <Text style={[styles.statsText, { color: activeColors.muted }]}>
                                {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={[styles.headerTitle, { color: activeColors.text }]}>My Projects</Text>
                        <Text style={[styles.headerSubtitle, { color: activeColors.muted }]}>
                            Building the future, one project at a time
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.createBtn, { backgroundColor: activeColors.tint }]}
                        onPress={() => router.push('/modal')}
                    >
                        <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.statsContainer}
                    contentContainerStyle={styles.statsContent}
                >
                    {renderStatCard(Briefcase, 'Total', stats.total, '#6366f1')}
                    {renderStatCard(Rocket, 'Active', stats.active, '#10b981')}
                    {renderStatCard(TrendingUp, 'Growing', stats.completed, '#f59e0b')}
                    {renderStatCard(DollarSign, 'Raised', formatCurrency(stats.funding), '#ef4444')}
                </ScrollView>
            </View>

            {/* Filters */}
            <View style={styles.filtersSection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                >
                    {STAGE_CONFIG.map((stage) => {
                        const Icon = stage.icon;
                        const isActive = selectedStage === stage.id;
                        return (
                            <TouchableOpacity
                                key={stage.id}
                                style={[
                                    styles.filterChip,
                                    {
                                        backgroundColor: isActive ? stage.color : activeColors.card,
                                        borderColor: isActive ? stage.color : activeColors.border,
                                    }
                                ]}
                                onPress={() => setSelectedStage(stage.id)}
                            >
                                <Icon size={16} color={isActive ? '#fff' : activeColors.muted} />
                                <Text style={[
                                    styles.filterChipText,
                                    { color: isActive ? '#fff' : activeColors.text }
                                ]}>
                                    {stage.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.viewBtn, viewMode === VIEW_MODES.GRID && { backgroundColor: `${activeColors.tint}20` }]}
                        onPress={() => setViewMode(VIEW_MODES.GRID)}
                    >
                        <Grid size={18} color={viewMode === VIEW_MODES.GRID ? activeColors.tint : activeColors.muted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewBtn, viewMode === VIEW_MODES.LIST && { backgroundColor: `${activeColors.tint}20` }]}
                        onPress={() => setViewMode(VIEW_MODES.LIST)}
                    >
                        <List size={18} color={viewMode === VIEW_MODES.LIST ? activeColors.tint : activeColors.muted} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Projects List */}
            <ScrollView
                style={styles.projectsList}
                contentContainerStyle={[
                    viewMode === VIEW_MODES.GRID ? styles.gridContainer : styles.listContainer
                ]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColors.tint} />
                }
            >
                {filteredProjects.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Briefcase size={64} color={activeColors.muted} />
                        <Text style={[styles.emptyTitle, { color: activeColors.text }]}>
                            {selectedStage === 'all' ? 'No Projects Yet' : `No ${selectedStage} Projects`}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: activeColors.muted }]}>
                            Start building your empire by creating your first project
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyBtn, { backgroundColor: activeColors.tint }]}
                            onPress={() => router.push('/modal')}
                        >
                            <Plus size={20} color="#fff" />
                            <Text style={styles.emptyBtnText}>Create Project</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filteredProjects.map(renderProjectCard)
                )}
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    createBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        marginTop: 8,
    },
    statsContent: {
        gap: 12,
    },
    statCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        minWidth: 120,
        alignItems: 'center',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    filtersSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingLeft: 16,
        gap: 12,
    },
    filtersContent: {
        gap: 8,
        paddingRight: 16,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    viewToggle: {
        flexDirection: 'row',
        gap: 4,
        marginRight: 16,
    },
    viewBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    projectsList: {
        flex: 1,
    },
    gridContainer: {
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    listContainer: {
        padding: 16,
    },
    gridCard: {
        width: (width - 48) / 2,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 16,
    },
    gridCardImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    gridCardImagePlaceholder: {
        width: '100%',
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridCardContent: {
        padding: 12,
    },
    stageBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
    },
    stageBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    gridCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    gridCardCategory: {
        fontSize: 12,
        marginBottom: 12,
    },
    fundingContainer: {
        marginBottom: 12,
    },
    fundingInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    fundingLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    fundingValue: {
        fontSize: 13,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    gridCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statsText: {
        fontSize: 11,
        fontWeight: '600',
    },
    listCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 12,
        marginBottom: 12,
    },
    listCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    listCardImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    listCardImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listCardInfo: {
        flex: 1,
    },
    listCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    listCardCategory: {
        fontSize: 13,
        marginBottom: 6,
    },
    listCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stagePill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    stagePillText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    listCardRight: {
        alignItems: 'flex-end',
    },
    fundingAmount: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    fundingGoal: {
        fontSize: 11,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    emptyBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
