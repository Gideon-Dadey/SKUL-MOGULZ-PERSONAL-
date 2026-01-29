
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Settings, LogOut } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const activeColors = Colors[theme];

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Profile</Text>
                <TouchableOpacity>
                    <Settings size={24} color={activeColors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.profileCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                    <Image
                        source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=A5D6B7&color=fff` }}
                        style={styles.avatar}
                    />
                    <Text style={[styles.name, { color: activeColors.text }]}>{user?.firstName} {user?.lastName}</Text>
                    <Text style={[styles.username, { color: activeColors.muted }]}>@{user?.username}</Text>
                    <Text style={[styles.bio, { color: activeColors.text }]}>{user?.bio || 'No bio yet'}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: activeColors.text }]}>{user?.connections?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: activeColors.muted }]}>Connections</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: activeColors.text }]}>{user?.viewedProfile || 0}</Text>
                            <Text style={[styles.statLabel, { color: activeColors.muted }]}>Views</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { borderColor: '#ef4444' }]}
                    onPress={handleLogout}
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
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
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 20,
    },
    profileCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        marginBottom: 16,
    },
    bio: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 20,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
});
