
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, MapPin, Users, MoreHorizontal, Folder, GraduationCap, Award } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';

interface Experience {
    id?: string;
    _id?: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
}

interface Education {
    id?: string;
    _id?: string;
    school: string;
    degree: string;
    field?: string;
    fieldOfStudy?: string;
    startYear?: string;
    endYear?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/network/users/${id}`);
                setUser(response.data);
            } catch (err: any) {
                console.error('Error fetching user:', err);
                setError('Could not load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleConnect = async () => {
        try {
            await api.post('/network/request', { recipientId: user._id || user.id });
            setUser((prev: any) => ({ ...prev, connectionStatus: 'pending_sent' }));
        } catch (error) {
            console.error("Failed to send connection request", error);
        }
    };

    const handleAcceptRequest = async () => {
        try {
            if (!user.requestId) return;
            await api.put(`/network/request/${user.requestId}/accept`);
            setUser((prev: any) => ({
                ...prev,
                connectionStatus: 'connected',
                connectionsCount: (prev.connectionsCount || 0) + 1
            }));
        } catch (error) {
            console.error("Failed to accept connection request", error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: activeColors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={activeColors.tint} />
                <Text style={[styles.loadingText, { color: activeColors.muted }]}>Loading profile...</Text>
            </View>
        );
    }

    if (error || !user) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: activeColors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={[styles.errorText, { color: activeColors.text }]}>{error || 'User not found'}</Text>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: activeColors.tint }]}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const experiences: Experience[] = user.experience || [];
    const educations: Education[] = user.education || [];
    const skills: string[] = user.skills || user.interests || [];

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: activeColors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Profile</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <MoreHorizontal size={24} color={activeColors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Banner & Avatar */}
                <View style={[styles.profileHeader, { backgroundColor: activeColors.card }]}>
                    <View style={[styles.banner, { backgroundColor: activeColors.tint + '40' }]}>
                        {user.banner && (
                            <Image source={{ uri: getImageUrl(user.banner) || '' }} style={styles.bannerImage} />
                        )}
                    </View>

                    <View style={styles.profileInfoContainer}>
                        <View style={[styles.avatarWrapper, { borderColor: activeColors.card, backgroundColor: activeColors.card }]}>
                            <Image
                                source={{ uri: getImageUrl(user.avatar) || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=A5D6B7&color=fff` }}
                                style={styles.avatar}
                            />
                        </View>

                        <View style={styles.userDetails}>
                            <Text style={[styles.name, { color: activeColors.text }]}>{user.firstName} {user.lastName}</Text>
                            <Text style={[styles.headline, { color: activeColors.text }]}>{user.headline || user.role || 'Student Entrepreneur'}</Text>

                            <View style={styles.metaRow}>
                                {user.location && (
                                    <View style={styles.metaItem}>
                                        <MapPin size={14} color={activeColors.muted} />
                                        <Text style={[styles.metaText, { color: activeColors.muted }]}>{user.location}</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.metaItem}
                                    onPress={() => router.push({
                                        pathname: '/profile/connections',
                                        params: { userId: user._id || user.id }
                                    })}
                                >
                                    <Users size={14} color={activeColors.tint} />
                                    <Text style={[styles.metaText, { color: activeColors.tint, fontWeight: '600' }]}>
                                        {user.connections?.length || user.connectionsCount || 0} connections
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionBtnPrimary, { backgroundColor: activeColors.tint }]}
                                onPress={() => router.push(('/messages/' + (user._id || user.id)) as any)}
                            >
                                <Ionicons name="chatbubbles-outline" size={18} color="#000" />
                                <Text style={styles.actionBtnTextPrimary}>Message</Text>
                            </TouchableOpacity>

                            {user.connectionStatus === 'self' ? null : (
                                <TouchableOpacity
                                    style={[
                                        styles.actionBtnSecondary,
                                        { borderColor: activeColors.tint, opacity: (user.connectionStatus === 'connected' || user.connectionStatus === 'pending_sent') ? 0.6 : 1 }
                                    ]}
                                    disabled={user.connectionStatus === 'connected' || user.connectionStatus === 'pending_sent'}
                                    onPress={user.connectionStatus === 'pending_received' ? handleAcceptRequest : handleConnect}
                                >
                                    <Text style={[styles.actionBtnTextSecondary, { color: activeColors.tint }]}>
                                        {user.connectionStatus === 'connected' ? 'Connected' :
                                            user.connectionStatus === 'pending_sent' ? 'Pending' :
                                                user.connectionStatus === 'pending_received' ? 'Accept' : 'Connect'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <Text style={[styles.sectionTitle, { color: activeColors.text }]}>About</Text>
                    <Text style={[styles.bodyText, { color: user.bio ? activeColors.text : activeColors.muted }]}>
                        {user.bio || "This user hasn't added a bio yet."}
                    </Text>
                </View>

                {/* Experience Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Experience</Text>
                    {experiences.length > 0 ? (
                        experiences.map((exp, index) => (
                            <View key={exp.id || exp._id || index} style={[styles.listItem, { borderTopColor: activeColors.border }]}>
                                <View style={[styles.listIcon, { backgroundColor: activeColors.tint + '20' }]}>
                                    <Folder size={20} color={activeColors.tint} />
                                </View>
                                <View style={styles.listContent}>
                                    <Text style={[styles.listTitle, { color: activeColors.text }]}>{exp.title}</Text>
                                    <Text style={[styles.listSubtitle, { color: activeColors.text }]}>{exp.company}</Text>
                                    <Text style={[styles.listMeta, { color: activeColors.muted }]}>
                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                    </Text>
                                    {exp.description && (
                                        <Text style={[styles.listDesc, { color: activeColors.muted }]}>{exp.description}</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: activeColors.muted }]}>No experience listed.</Text>
                    )}
                </View>

                {/* Education Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Education</Text>
                    {educations.length > 0 ? (
                        educations.map((edu, index) => (
                            <View key={edu.id || edu._id || index} style={[styles.listItem, { borderTopColor: activeColors.border }]}>
                                <View style={[styles.listIcon, { backgroundColor: activeColors.tint + '20' }]}>
                                    <GraduationCap size={20} color={activeColors.tint} />
                                </View>
                                <View style={styles.listContent}>
                                    <Text style={[styles.listTitle, { color: activeColors.text }]}>{edu.school}</Text>
                                    <Text style={[styles.listSubtitle, { color: activeColors.text }]}>
                                        {edu.degree}{edu.field || edu.fieldOfStudy ? `, ${edu.field || edu.fieldOfStudy}` : ''}
                                    </Text>
                                    <Text style={[styles.listMeta, { color: activeColors.muted }]}>
                                        {edu.startYear || edu.startDate} - {edu.endYear || edu.endDate || 'Present'}
                                    </Text>
                                    {edu.description && (
                                        <Text style={[styles.listDesc, { color: activeColors.muted }]}>{edu.description}</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: activeColors.muted }]}>No education listed.</Text>
                    )}
                </View>

                {/* Skills Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Skills</Text>
                    {skills.length > 0 ? (
                        <View style={styles.skillsContainer}>
                            {skills.map((skill, index) => (
                                <View key={index} style={[styles.skillChip, { backgroundColor: activeColors.tint + '20', borderColor: activeColors.tint }]}>
                                    <Text style={[styles.skillText, { color: activeColors.tint }]}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[styles.emptyText, { color: activeColors.muted }]}>No skills listed.</Text>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    errorText: { fontSize: 16, marginBottom: 16 },
    backButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    backButtonText: { color: '#000', fontWeight: '600' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 36, paddingBottom: 12,
        height: Platform.OS === 'ios' ? 100 : 86,
    },
    headerBtn: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    profileHeader: { marginBottom: 8 },
    banner: { height: 100, width: '100%' },
    bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    profileInfoContainer: { paddingHorizontal: 16, paddingBottom: 20 },
    avatarWrapper: { marginTop: -60, width: 120, height: 120, borderRadius: 60, borderWidth: 4, overflow: 'hidden' },
    avatar: { width: '100%', height: '100%' },
    userDetails: { marginTop: 12 },
    name: { fontSize: 24, fontWeight: '700' },
    headline: { fontSize: 16, marginTop: 4, lineHeight: 20 },
    metaRow: { flexDirection: 'row', marginTop: 12, gap: 16, flexWrap: 'wrap' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 14 },
    actionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
    actionBtnPrimary: { flexDirection: 'row', paddingHorizontal: 20, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 6 },
    actionBtnTextPrimary: { color: '#000', fontWeight: '700', fontSize: 15 },
    actionBtnSecondary: { paddingHorizontal: 20, height: 40, borderRadius: 20, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
    actionBtnTextSecondary: { fontWeight: '700', fontSize: 15 },
    section: { padding: 16, marginBottom: 8 },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
    bodyText: { fontSize: 14, lineHeight: 22 },
    emptyText: { fontSize: 14, fontStyle: 'italic' },
    listItem: { flexDirection: 'row', paddingVertical: 16, borderTopWidth: 1, gap: 12 },
    listIcon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    listContent: { flex: 1 },
    listTitle: { fontSize: 16, fontWeight: '700' },
    listSubtitle: { fontSize: 14, marginTop: 2 },
    listMeta: { fontSize: 12, marginTop: 4 },
    listDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    skillText: { fontSize: 14, fontWeight: '600' },
});
