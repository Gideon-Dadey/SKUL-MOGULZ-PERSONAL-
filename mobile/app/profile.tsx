
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, RefreshControl, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Settings, LogOut, MapPin, Calendar, Edit2, Plus, Users, BarChart2, Eye, Info, PenTool, ExternalLink, Moon, Sun } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api, { getImageUrl } from '../services/api';
import PostCard from '../components/PostCard';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const activeColors = Colors[theme];

    const [myProjects, setMyProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyProjects = async () => {
        try {
            if (!user?.id && !user?._id) return;
            const response = await api.get(`/projects?author=${user.id || user._id}`);
            const adaptedPosts = response.data.map((p: any) => ({
                ...p,
                id: p._id || p.id,
                likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
                likedBy: Array.isArray(p.likes) ? p.likes : [],
                comments: p.comments || [],
                author: {
                    ...p.author,
                    id: p.author?._id || p.author?.id
                }
            }));
            setMyProjects(adaptedPosts);
        } catch (error) {
            console.error("Failed to fetch my projects", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyProjects();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyProjects();
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            {/* Nav Header */}
            <View style={[styles.navHeader, { backgroundColor: activeColors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>{user?.username || 'Profile'}</Text>
                <TouchableOpacity onPress={() => { }} style={styles.iconBtn}>
                    <Settings size={22} color={activeColors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColors.tint} />}
            >
                {/* Header Section (Banner & Profile Pic) */}
                <View style={[styles.profileHeader, { backgroundColor: activeColors.card }]}>
                    <View style={[styles.banner, { backgroundColor: activeColors.tint + '40' }]}>
                        <TouchableOpacity style={styles.editBannerBtn}>
                            <PenTool size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileInfoContainer}>
                        <View style={[styles.avatarWrapper, { borderColor: activeColors.card, backgroundColor: activeColors.card }]}>
                            <Image
                                source={{ uri: getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=A5D6B7&color=fff` }}
                                style={styles.avatar}
                            />
                        </View>

                        <TouchableOpacity style={styles.editProfileIcon} onPress={() => router.push('/edit-profile')}>
                            <Edit2 size={20} color={activeColors.muted} />
                        </TouchableOpacity>

                        <View style={styles.userDetails}>
                            <Text style={[styles.name, { color: activeColors.text }]}>{user?.firstName} {user?.lastName}</Text>
                            <Text style={[styles.headline, { color: activeColors.text }]}>{user?.headline || (user?.role === 'student' ? 'Student Entrepreneur' : 'Investor')}</Text>

                            <View style={styles.metaRow}>
                                {user?.location && (
                                    <View style={styles.metaItem}>
                                        <MapPin size={14} color={activeColors.muted} />
                                        <Text style={[styles.metaText, { color: activeColors.muted }]}>{user.location}</Text>
                                    </View>
                                )}
                                <View style={styles.metaItem}>
                                    <Users size={14} color={activeColors.tint} />
                                    <Text style={[styles.metaText, { color: activeColors.tint, fontWeight: '600' }]}>{user?.connections?.length || 0} connections</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={[styles.actionBtnPrimary, { backgroundColor: activeColors.tint }]}>
                                <Text style={styles.actionBtnTextPrimary}>Open to</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtnSecondary, { borderColor: activeColors.tint }]}>
                                <Text style={[styles.actionBtnTextSecondary, { color: activeColors.tint }]}>Add profile section</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Theme Switcher Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLabelContainer}>
                            {theme === 'dark' ? <Moon size={20} color={activeColors.text} /> : <Sun size={20} color={activeColors.text} />}
                            <View style={{ marginLeft: 12 }}>
                                <Text style={[styles.settingLabel, { color: activeColors.text }]}>Dark Mode</Text>
                                <Text style={[styles.settingSublabel, { color: activeColors.muted }]}>{theme === 'dark' ? 'On' : 'Off'}</Text>
                            </View>
                        </View>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: activeColors.tint }}
                            thumbColor={theme === 'dark' ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Analytics Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Analytics</Text>
                            <View style={styles.privateRow}>
                                <Eye size={12} color={activeColors.muted} />
                                <Text style={[styles.privateLabel, { color: activeColors.muted }]}>Private to you</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.analyticsGrid}>
                        <View style={styles.analyticsItem}>
                            <View style={styles.analyticsHeader}>
                                <Users size={20} color={activeColors.text} />
                                <Text style={[styles.analyticsValue, { color: activeColors.text }]}>{user?.viewedProfile || 0}</Text>
                            </View>
                            <Text style={[styles.analyticsLabel, { color: activeColors.text }]}>profile views</Text>
                            <Text style={[styles.analyticsSub, { color: activeColors.muted }]}>See who's viewed your profile.</Text>
                        </View>
                        <View style={[styles.analyticsItem, { borderLeftWidth: 1, borderLeftColor: activeColors.border }]}>
                            <View style={styles.analyticsHeader}>
                                <BarChart2 size={20} color={activeColors.text} />
                                <Text style={[styles.analyticsValue, { color: activeColors.text }]}>{user?.impressions || 0}</Text>
                            </View>
                            <Text style={[styles.analyticsLabel, { color: activeColors.text }]}>post impressions</Text>
                            <Text style={[styles.analyticsSub, { color: activeColors.muted }]}>Check out who's engaging with your posts.</Text>
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>About</Text>
                        <TouchableOpacity onPress={() => router.push('/edit-profile')}>
                            <Edit2 size={20} color={activeColors.muted} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.aboutText, { color: activeColors.text }]}>
                        {user?.bio || "You haven't added an about section yet."}
                    </Text>
                </View>

                {/* Projects Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Projects</Text>
                        <TouchableOpacity onPress={() => router.push('/modal')}>
                            <Plus size={24} color={activeColors.muted} />
                        </TouchableOpacity>
                    </View>

                    {myProjects.length > 0 ? (
                        <View style={styles.projectsList}>
                            {myProjects.slice(0, 3).map((project) => (
                                <View key={project.id} style={[styles.projectItem, { borderBottomColor: activeColors.border }]}>
                                    <View style={styles.projectInfo}>
                                        <Text style={[styles.projectTitle, { color: activeColors.text }]} numberOfLines={1}>{project.title}</Text>
                                        <Text style={[styles.projectStage, { color: activeColors.tint }]}>{project.projectStage?.toUpperCase()}</Text>
                                        <Text style={[styles.projectDesc, { color: activeColors.muted }]} numberOfLines={2}>{project.content}</Text>
                                    </View>
                                    {project.media && project.media.length > 0 && (
                                        <Image source={{ uri: getImageUrl(project.media[0]) || '' }} style={styles.projectImage} />
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[styles.emptyText, { color: activeColors.muted }]}>No projects showcased yet.</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { borderColor: '#ef4444' }]}
                    onPress={handleLogout}
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 36,
        paddingBottom: 12,
        height: Platform.OS === 'ios' ? 100 : 86,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    iconBtn: {
        padding: 4,
    },
    scrollContent: {
        flexGrow: 1,
    },
    profileHeader: {
        marginBottom: 8,
    },
    banner: {
        height: 100,
        width: '100%',
    },
    editBannerBtn: {
        position: 'absolute',
        right: 16,
        top: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfoContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    avatarWrapper: {
        marginTop: -60,
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    editProfileIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
    },
    userDetails: {
        marginTop: 12,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
    },
    headline: {
        fontSize: 16,
        marginTop: 4,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 20,
    },
    actionBtnPrimary: {
        paddingHorizontal: 16,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnTextPrimary: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    actionBtnSecondary: {
        paddingHorizontal: 16,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnTextSecondary: {
        fontWeight: '700',
        fontSize: 15,
    },
    section: {
        padding: 16,
        marginBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    settingSublabel: {
        fontSize: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    privateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    privateLabel: {
        fontSize: 12,
    },
    analyticsGrid: {
        flexDirection: 'row',
        marginTop: 8,
    },
    analyticsItem: {
        flex: 1,
        paddingRight: 12,
    },
    analyticsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    analyticsValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    analyticsLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    analyticsSub: {
        fontSize: 12,
        marginTop: 2,
        lineHeight: 16,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 20,
    },
    projectsList: {
        gap: 16,
    },
    projectItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    projectInfo: {
        flex: 1,
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    projectStage: {
        fontSize: 11,
        fontWeight: '800',
        marginTop: 2,
    },
    projectDesc: {
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    projectImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
        marginHorizontal: 16,
        marginTop: 12,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 15,
        fontWeight: '600',
    },
});
