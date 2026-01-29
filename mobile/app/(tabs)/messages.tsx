
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';

export default function MessagesScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const activeColors = Colors[theme];
    const insets = useSafeAreaInsets();

    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/messages/conversations');
            setConversations(response.data || []);
        } catch (error) {
            console.error('Fetch conversations error', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchConversations();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.conversationItem, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}
            onPress={() => router.push(('/messages/' + item._id) as any)}
        >
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: getImageUrl(item.user.avatar) || `https://ui-avatars.com/api/?name=${item.user.firstName}+${item.user.lastName}` }}
                    style={styles.avatar}
                />
            </View>
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={[styles.name, { color: activeColors.text }]}>
                        {item.user.firstName} {item.user.lastName}
                    </Text>
                    <Text style={[styles.time, { color: activeColors.muted }]}>
                        {new Date(item.lastMessageDate).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={[styles.message, { color: item.unreadCount > 0 ? activeColors.text : activeColors.muted, fontWeight: item.unreadCount > 0 ? '700' : '400' }]} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: activeColors.tint }]}>
                            <Text style={styles.badgeText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: activeColors.border, backgroundColor: activeColors.card }]}>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Messages</Text>
            </View>

            {loading ? (
                <View style={[styles.container, styles.center]}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColors.tint} />}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2665/2665404.png' }} // Placeholder
                                style={{ width: 100, height: 100, marginBottom: 16, opacity: 0.5 }}
                            />
                            <Text style={[styles.emptyText, { color: activeColors.muted }]}>No messages yet</Text>
                            <Text style={[styles.emptySub, { color: activeColors.muted }]}>Connect with others to start chatting</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        elevation: 2,
    },
    headerTitle: { fontSize: 24, fontWeight: '800' },
    list: { paddingVertical: 8 },
    conversationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 0.5,
    },
    avatarContainer: { marginRight: 16 },
    avatar: { width: 56, height: 56, borderRadius: 28 },
    content: { flex: 1, justifyContent: 'center' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    name: { fontSize: 16, fontWeight: '700' },
    time: { fontSize: 12 },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    message: { fontSize: 14, flex: 1 },
    badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginLeft: 8 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    emptySub: { fontSize: 14 },
});
