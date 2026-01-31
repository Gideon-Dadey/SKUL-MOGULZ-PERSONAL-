
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Laptop, Smartphone, Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api from '../services/api';

export default function ActiveSessionsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/auth/sessions');
            setSessions(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const revokeSession = async (sessionId: string) => {
        Alert.alert(
            'Revoke Session',
            'Are you sure you want to log out from this device?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Revoke',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/auth/sessions/${sessionId}`);
                            setSessions(sessions.filter(s => s.id !== sessionId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to revoke session');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const isMobile = item.device.toLowerCase().includes('mobile') || item.device.toLowerCase().includes('iphone') || item.device.toLowerCase().includes('android');
        const Icon = isMobile ? Smartphone : Laptop;

        return (
            <View style={[styles.sessionItem, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <View style={styles.sessionIcon}>
                    <Icon size={24} color={activeColors.text} />
                </View>
                <View style={styles.sessionInfo}>
                    <Text style={[styles.deviceName, { color: activeColors.text }]} numberOfLines={1}>
                        {item.device}
                    </Text>
                    <Text style={[styles.location, { color: activeColors.muted }]}>
                        {item.location} • {item.ip}
                    </Text>
                    <Text style={[styles.lastActive, { color: activeColors.muted }]}>
                        Last active: {new Date(item.lastActive).toLocaleDateString()}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => revokeSession(item.id)} style={styles.revokeBtn}>
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Active Sessions</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={{ color: activeColors.muted }}>No active sessions found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 36, paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingVertical: 12 },
    sessionItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    sessionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sessionInfo: { flex: 1 },
    deviceName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    location: { fontSize: 14, marginBottom: 2 },
    lastActive: { fontSize: 12 },
    revokeBtn: { padding: 8 },
    emptyContainer: { padding: 40, alignItems: 'center' },
});
