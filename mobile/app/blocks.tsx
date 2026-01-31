
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Ban, UserMinus } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api, { getImageUrl } from '../services/api';

export default function BlocksScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBlocked = async () => {
        try {
            const response = await api.get('/auth/blocked');
            setBlockedUsers(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlocked();
    }, []);

    const toggleBlock = async (user: any) => {
        Alert.alert(
            'Unblock User',
            `Are you sure you want to unblock ${user.firstName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        try {
                            await api.post(`/auth/blocked/${user._id || user.id}`);
                            setBlockedUsers(blockedUsers.filter(u => (u._id || u.id) !== (user._id || user.id)));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to unblock user');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.userRow, { borderBottomColor: activeColors.border }]}>
            <Image
                source={item.avatar ? { uri: getImageUrl(item.avatar) } : require('../assets/images/icon.png')}
                style={styles.avatar}
            />
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: activeColors.text }]}>{item.firstName} {item.lastName}</Text>
                <Text style={[styles.userHandle, { color: activeColors.muted }]}>@{item.username}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleBlock(item)} style={[styles.unblockBtn, { borderColor: activeColors.tint }]}>
                <Text style={[styles.unblockText, { color: activeColors.tint }]}>Unblock</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Blocked Users</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : (
                <FlatList
                    data={blockedUsers}
                    keyExtractor={(item) => (item._id || item.id).toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ban size={48} color={activeColors.muted} style={{ marginBottom: 16 }} />
                            <Text style={{ color: activeColors.muted, fontSize: 16, textAlign: 'center' }}>
                                You haven't blocked anyone yet.
                            </Text>
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
    userRow: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '600' },
    userHandle: { fontSize: 14 },
    unblockBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    unblockText: { fontSize: 14, fontWeight: '600' },
    emptyContainer: { padding: 60, alignItems: 'center' },
});
