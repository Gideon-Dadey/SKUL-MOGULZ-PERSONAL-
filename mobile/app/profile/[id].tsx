
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, MapPin, Users, MessageCircle, MoreHorizontal, Briefcase } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';

const { width } = Dimensions.get('window');

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/network/users/${id}`);
                setUser(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchUser();
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: activeColors.background }]}>
                <ActivityIndicator size="large" color={activeColors.tint} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: activeColors.background }]}>
                <Text style={{ color: activeColors.text }}>User not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: activeColors.background }]} showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Banner */}
            <View style={styles.bannerContainer}>
                <Image
                    source={{ uri: getImageUrl(user.banner) || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80' }}
                    style={styles.banner}
                />
                <View style={styles.bannerOverlay} />
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.avatarContainer, { backgroundColor: activeColors.background }]}>
                    <Image
                        source={{ uri: getImageUrl(user.avatar) || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}` }}
                        style={styles.avatar}
                    />
                </View>

                <View style={styles.mainInfo}>
                    <Text style={[styles.name, { color: activeColors.text }]}>{user.firstName} {user.lastName}</Text>
                    <Text style={[styles.headline, { color: activeColors.text }]}>{user.headline || user.role || 'Student Entrepreneur'}</Text>

                    <View style={styles.statsRow}>
                        {user.location && (
                            <View style={styles.statItem}>
                                <MapPin size={14} color={activeColors.muted} />
                                <Text style={[styles.statText, { color: activeColors.muted }]}>{user.location}</Text>
                            </View>
                        )}
                        <View style={styles.statItem}>
                            <Users size={14} color={activeColors.tint} />
                            <Text style={[styles.statText, { color: activeColors.tint, fontWeight: '700' }]}>{user.connections?.length || 0} connections</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: activeColors.tint, shadowColor: activeColors.tint }]}
                            onPress={() => router.push(('/messages/' + (user._id || user.id)) as any)}
                        >
                            <MessageCircle size={20} color="#fff" />
                            <Text style={styles.primaryBtnText}>Message</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.iconBtn, { borderColor: activeColors.border, backgroundColor: activeColors.card }]}>
                            <MoreHorizontal size={24} color={activeColors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.section, { borderTopColor: activeColors.border }]}>
                    <Text style={[styles.sectionTitle, { color: activeColors.text }]}>About</Text>
                    <Text style={[styles.sectionText, { color: activeColors.text }]}>
                        {user.bio || "This user hasn't added a bio yet."}
                    </Text>
                </View>

                {/* Example Content Section */}
                <View style={[styles.section, { borderTopColor: activeColors.border }]}>
                    <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Activity</Text>
                    <View style={[styles.activityCard, { backgroundColor: activeColors.card }]}>
                        <Text style={[styles.activityText, { color: activeColors.muted }]}>No recent activity to show.</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    bannerContainer: { height: 180, width: '100%', position: 'relative' },
    banner: { width: '100%', height: '100%' },
    bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' }, // Subtle dim
    backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    content: { paddingHorizontal: 20 },
    avatarContainer: { marginTop: -60, width: 120, height: 120, borderRadius: 60, padding: 5, alignItems: 'center', justifyContent: 'center' },
    avatar: { width: '100%', height: '100%', borderRadius: 60 },
    mainInfo: { marginTop: 16, marginBottom: 24 },
    name: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    headline: { fontSize: 17, marginTop: 6, lineHeight: 24, fontWeight: '500' },
    statsRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { fontSize: 14 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    primaryBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    iconBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    section: { paddingTop: 24, paddingBottom: 8, borderTopWidth: 1, marginTop: 8 },
    sectionTitle: { fontSize: 19, fontWeight: '700', marginBottom: 12 },
    sectionText: { fontSize: 15, lineHeight: 24, opacity: 0.9 },
    activityCard: { padding: 20, borderRadius: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
    activityText: { fontStyle: 'italic' }
});
