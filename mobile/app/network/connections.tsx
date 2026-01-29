
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, MessageCircle, MoreHorizontal } from 'lucide-react-native';
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
            style={[styles.itemCallback, { borderBottomColor: activeColors.border }]}
            onPress={() => router.push(('/profile/' + item._id) as any)}
        >
            <Image
                source={{ uri: getImageUrl(item.avatar) || `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=A5D6B7&color=fff` }}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <Text style={[styles.name, { color: activeColors.text }]}>{item.firstName} {item.lastName}</Text>
                <Text style={[styles.headline, { color: activeColors.muted }]} numberOfLines={1}>{item.headline || item.role}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: activeColors.border }]}
                    onPress={() => router.push(('/messages/' + item._id) as any)}
                >
                    <MessageCircle size={20} color={activeColors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: activeColors.border }]}>
                    <MoreHorizontal size={20} color={activeColors.text} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Connections</Text>
                <TouchableOpacity style={styles.searchBtn}>
                    <Search size={22} color={activeColors.text} />
                </TouchableOpacity>
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
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={[styles.emptyText, { color: activeColors.muted }]}>You don't have any connections yet.</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    backBtn: { padding: 4 },
    searchBtn: { padding: 4 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
    list: { padding: 16 },
    itemCallback: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    avatar: { width: 56, height: 56, borderRadius: 28 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '700' },
    headline: { fontSize: 14 },
    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16 },
});
