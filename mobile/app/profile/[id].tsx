
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Users, MessageCircle, MoreHorizontal } from 'lucide-react-native';
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
        <ScrollView style={[styles.container, { backgroundColor: activeColors.background }]}>
            <View style={[styles.header]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Image
                    source={{ uri: getImageUrl(user.banner) || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800' }}
                    style={styles.banner}
                />
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

                    <View style={styles.metaRow}>
                        {user.location && (
                            <View style={styles.metaItem}>
                                <MapPin size={14} color={activeColors.muted} />
                                <Text style={[styles.metaText, { color: activeColors.muted }]}>{user.location}</Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <Users size={14} color={activeColors.tint} />
                            <Text style={[styles.metaText, { color: activeColors.tint, fontWeight: '700' }]}>{user.connections?.length || 0} connections</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: activeColors.tint }]}
                            onPress={() => router.push(('/messages/' + user._id || user.id) as any)}
                        >
                            <MessageCircle size={20} color="#fff" />
                            <Text style={styles.primaryBtnText}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconBtn, { borderColor: activeColors.border }]}>
                            <MoreHorizontal size={24} color={activeColors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.section, { borderTopColor: activeColors.border }]}>
                    <Text style={[styles.sectionTitle, { color: activeColors.text }]}>About</Text>
                    <Text style={[styles.sectionText, { color: activeColors.text }]}>
                        {user.bio || "No bio available."}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { height: 120, position: 'relative' },
    banner: { width: '100%', height: '100%' },
    backBtn: { position: 'absolute', top: 40, left: 16, zIndex: 10, padding: 8, borderRadius: 20 },
    content: { paddingHorizontal: 16 },
    avatarContainer: { marginTop: -50, width: 100, height: 100, borderRadius: 50, padding: 4, alignItems: 'center', justifyContent: 'center' },
    avatar: { width: '100%', height: '100%', borderRadius: 50 },
    mainInfo: { marginTop: 12, marginBottom: 24 },
    name: { fontSize: 24, fontWeight: '800' },
    headline: { fontSize: 16, marginTop: 4, lineHeight: 22 },
    metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 14 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    primaryBtn: { flex: 1, flexDirection: 'row', height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', gap: 8 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    section: { paddingTop: 24, borderTopWidth: 1 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    sectionText: { fontSize: 14, lineHeight: 22 },
});
