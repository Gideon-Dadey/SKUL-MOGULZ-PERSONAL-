
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, UserPlus, Search, CircleUser } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';

export default function ConnectionsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { userId } = useLocalSearchParams();
    const activeColors = Colors[theme];

    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const response = await api.get('/network/connections', {
                params: { userId }
            });
            setConnections(response.data);
        } catch (error) {
            console.error('Failed to fetch connections:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchConnections();
    };

    const renderConnectionItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.connectionItem, { borderBottomColor: activeColors.border }]}
            onPress={() => router.push(`/profile/${item._id || item.id}`)}
        >
            <View style={styles.avatarContainer}>
                {item.avatar ? (
                    <Image source={{ uri: getImageUrl(item.avatar) || '' }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: activeColors.border }]}>
                        <CircleUser size={40} color={activeColors.muted} />
                    </View>
                )}
            </View>
            <View style={styles.connectionDetails}>
                <Text style={[styles.connectionName, { color: activeColors.text }]}>
                    {item.firstName} {item.lastName}
                </Text>
                <Text style={[styles.connectionHeadline, { color: activeColors.muted }]} numberOfLines={1}>
                    {item.headline || item.role || 'Student Entrepreneur'}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.messageBtn, { borderColor: activeColors.tint }]}
                onPress={() => router.push(`/messages/${item._id || item.id}`)}
            >
                <Text style={[styles.messageBtnText, { color: activeColors.tint }]}>Message</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: activeColors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Connections</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : (
                <FlatList
                    data={connections}
                    keyExtractor={(item) => item._id || item.id}
                    renderItem={renderConnectionItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <UserPlus size={60} color={activeColors.muted} />
                            <Text style={[styles.emptyTitle, { color: activeColors.text }]}>No connections yet</Text>
                            <Text style={[styles.emptySubtitle, { color: activeColors.muted }]}>
                                Build your network to see connections here.
                            </Text>
                            <TouchableOpacity
                                style={[styles.discoverBtn, { backgroundColor: activeColors.tint }]}
                                onPress={() => router.push('/network')}
                            >
                                <Text style={styles.discoverBtnText}>Discover People</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 36, paddingBottom: 12,
        height: Platform.OS === 'ios' ? 100 : 86,
    },
    headerBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    listContent: { paddingBottom: 20 },
    connectionItem: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1,
    },
    avatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
    avatar: { width: '100%', height: '100%' },
    avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    connectionDetails: { flex: 1, marginLeft: 16 },
    connectionName: { fontSize: 16, fontWeight: '700' },
    connectionHeadline: { fontSize: 14, marginTop: 2 },
    messageBtn: {
        borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    },
    messageBtnText: { fontSize: 13, fontWeight: '700' },
    emptyState: { alignItems: 'center', padding: 40, marginTop: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 },
    discoverBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
    discoverBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
