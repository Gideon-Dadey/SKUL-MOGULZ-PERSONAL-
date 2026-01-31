
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, UserMinus, Volume2, VolumeX } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api, { getImageUrl } from '../services/api';

export default function MutesScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    const [mutedUsers, setMutedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMuted = async () => {
        try {
            const response = await api.get('/auth/muted');
            setMutedUsers(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMuted();
    }, []);

    const toggleMute = async (user: any) => {
        try {
            await api.post(`/auth/muted/${user._id || user.id}`);
            setMutedUsers(mutedUsers.filter(u => (u._id || u.id) !== (user._id || user.id)));
            Alert.alert('Success', `${user.firstName} has been unmuted.`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update mute status');
        }
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
            <TouchableOpacity onPress={() => toggleMute(item)} style={styles.actionBtn}>
                <Volume2 size={24} color={activeColors.tint} />
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
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Muted Users</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : (
                <FlatList
                    data={mutedUsers}
                    keyExtractor={(item) => (item._id || item.id).toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <VolumeX size={48} color={activeColors.muted} style={{ marginBottom: 16 }} />
                            <Text style={{ color: activeColors.muted, fontSize: 16, textAlign: 'center' }}>
                                You haven't muted anyone yet.
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
    actionBtn: { padding: 8 },
    emptyContainer: { padding: 60, alignItems: 'center' },
});
