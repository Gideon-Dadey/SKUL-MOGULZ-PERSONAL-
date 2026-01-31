
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Search, MoreHorizontal } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';

export default function ConnectionsScreen() {
    const { theme } = useTheme();
    const activeColors = Colors[theme];
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const response = await api.get('/network/connections');
                setConnections(response.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchConnections();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: activeColors.card, shadowColor: '#000' }]}
            onPress={() => router.push(('/profile/' + item._id) as any)}
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: getImageUrl(item.avatar) || `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=A5D6B7&color=fff` }}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <Text style={[styles.name, { color: activeColors.text }]}>{item.firstName} {item.lastName}</Text>
                <Text style={[styles.headline, { color: activeColors.muted }]} numberOfLines={1}>{item.headline || item.role || 'Student'}</Text>
                <Text style={[styles.subText, { color: activeColors.muted }]}>Connected</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: activeColors.background }]}
                    onPress={() => router.push(('/messages/' + item._id) as any)}
                >
                    <Ionicons name="chatbubbles-outline" size={20} color={activeColors.tint} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: activeColors.background }]}>
                    <MoreHorizontal size={20} color={activeColors.text} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Modern Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: activeColors.card }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={24} color={activeColors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: activeColors.text }]}>My Network</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Search Pill */}
                <View style={[styles.searchContainer, { backgroundColor: activeColors.background }]}>
                    <Search size={18} color={activeColors.muted} />
                    <Text style={[styles.searchPlaceholder, { color: activeColors.muted }]}>Search connections...</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : (
                <FlatList
                    data={connections}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={[styles.emptyText, { color: activeColors.muted }]}>No connections yet.</Text>
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
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
    backBtn: { padding: 4 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 16,
        gap: 10,
    },
    searchPlaceholder: { fontSize: 14, fontWeight: '500' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
    list: { padding: 16, paddingTop: 24 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    avatar: { width: 56, height: 56, borderRadius: 28 },
    info: { flex: 1, marginLeft: 16 },
    name: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    headline: { fontSize: 13, marginBottom: 4 },
    subText: { fontSize: 11, fontWeight: '600', opacity: 0.6 },
    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16 },
});
