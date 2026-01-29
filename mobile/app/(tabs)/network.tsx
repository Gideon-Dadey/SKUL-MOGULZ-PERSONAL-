
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserPlus, Users, Check, X, Search, Filter } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';

const { width } = Dimensions.get('window');
const COLUMN_count = 2;
const CARD_WIDTH = (width - 48) / COLUMN_count; // 16px padding * 3 gaps approx

export default function NetworkScreen() {
    const { theme } = useTheme();
    const activeColors = Colors[theme];
    const insets = useSafeAreaInsets();

    const [invitations, setInvitations] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [invitationsRes, suggestionsRes] = await Promise.all([
                api.get('/network/invitations'),
                api.get('/network/suggestions')
            ]);
            setInvitations(invitationsRes.data || []);
            setSuggestions(suggestionsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch network data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleConnect = async (userId: string) => {
        try {
            setActionLoading(userId);
            // Assuming the API expects userId within the body
            await api.post('/network/request', { userId });
            Alert.alert('Success', 'Connection request sent!');
            // Remove from suggestions locally
            setSuggestions(prev => prev.filter(u => u._id !== userId && u.id !== userId));
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to send request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAccept = async (requestId: string) => {
        try {
            setActionLoading(requestId);
            await api.put(`/network/request/${requestId}/accept`);
            // Remove from invitations locally
            setInvitations(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to accept connection');
        } finally {
            setActionLoading(null);
        }
    };

    const handleIgnore = async (requestId: string) => {
        // Implement ignore logic if API exists, or just hide
        // Assuming delete or ignore endpoint, but for now just hide from list
        setInvitations(prev => prev.filter(r => r._id !== requestId));
    };

    const renderInvitation = ({ item }: { item: any }) => (
        <View style={[styles.invitationCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <Image
                source={{ uri: getImageUrl(item.sender?.avatar) || `https://ui-avatars.com/api/?name=${item.sender?.firstName}+${item.sender?.lastName}&background=A5D6B7&color=fff` }}
                style={styles.invitationAvatar}
            />
            <View style={styles.invitationContent}>
                <Text style={[styles.invitationName, { color: activeColors.text }]}>
                    {item.sender?.firstName} {item.sender?.lastName}
                </Text>
                <Text style={[styles.invitationHeadline, { color: activeColors.muted }]} numberOfLines={1}>
                    {item.sender?.headline || 'Student Entrepreneur'}
                </Text>
            </View>
            <View style={styles.invitationActions}>
                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: '#fee2e2' }]}
                    onPress={() => handleIgnore(item._id)}
                >
                    <X size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: '#dcfce7' }]}
                    onPress={() => handleAccept(item._id)}
                    disabled={actionLoading === item._id}
                >
                    {actionLoading === item._id ? (
                        <ActivityIndicator size="small" color="#16a34a" />
                    ) : (
                        <Check size={20} color="#16a34a" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSuggestion = ({ item }: { item: any }) => (
        <View style={[styles.suggestionCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.suggestionHeader}>
                <Image
                    source={{ uri: getImageUrl(item.avatar) || `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=BFdbfe&color=fff` }}
                    style={styles.suggestionAvatar}
                />
                <TouchableOpacity
                    style={[styles.closeSuggestion, { backgroundColor: activeColors.background }]}
                    onPress={() => setSuggestions(prev => prev.filter(u => u._id !== item._id))}
                >
                    <X size={14} color={activeColors.muted} />
                </TouchableOpacity>
            </View>

            <View style={styles.suggestionInfo}>
                <Text style={[styles.suggestionName, { color: activeColors.text }]} numberOfLines={1}>
                    {item.firstName} {item.lastName}
                </Text>
                <Text style={[styles.suggestionRole, { color: activeColors.muted }]} numberOfLines={2}>
                    {item.headline || item.role || 'Student at University'}
                </Text>
                <Text style={[styles.suggestionMutual, { color: activeColors.muted }]}>
                    {item.mutualConnections ? `${item.mutualConnections} mutual connections` : 'Based on your profile'}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.connectBtn, { borderColor: activeColors.tint }]}
                onPress={() => handleConnect(item._id || item.id)}
                disabled={actionLoading === (item._id || item.id)}
            >
                {actionLoading === (item._id || item.id) ? (
                    <ActivityIndicator size="small" color={activeColors.tint} />
                ) : (
                    <>
                        <UserPlus size={16} color={activeColors.tint} />
                        <Text style={[styles.connectBtnText, { color: activeColors.tint }]}>Connect</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: activeColors.card, paddingTop: insets.top, borderBottomColor: activeColors.border }]}>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>My Network</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Search size={24} color={activeColors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Users size={24} color={activeColors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : (
                <FlatList
                    data={suggestions}
                    renderItem={renderSuggestion}
                    keyExtractor={(item, index) => item._id || item.id || index.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColors.tint} />
                    }
                    ListHeaderComponent={() => (
                        <View>
                            {/* Manage Network Section */}
                            <View style={[styles.manageSection, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                                <Text style={[styles.manageTitle, { color: activeColors.text }]}>Manage my network</Text>
                                <View style={styles.manageRow}>
                                    <Text style={[styles.manageLabel, { color: activeColors.muted }]}>Connections</Text>
                                    <Text style={[styles.manageCount, { color: activeColors.text }]}>128</Text>
                                </View>
                            </View>

                            {/* Invitations Section */}
                            {invitations.length > 0 && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Invitations ({invitations.length})</Text>
                                        <TouchableOpacity>
                                            <Text style={[styles.seeAll, { color: activeColors.tint }]}>See all</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {invitations.map(item => (
                                        <View key={item._id} style={{ marginBottom: 12 }}>
                                            {renderInvitation({ item })}
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Suggestions Header */}
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: activeColors.text }]}>People you may know</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: activeColors.muted }]}>No suggestions available right now.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    headerIcon: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    manageSection: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
    },
    manageTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    manageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    manageLabel: {
        fontSize: 16,
    },
    manageCount: {
        fontSize: 16,
        fontWeight: '700',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    invitationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    invitationAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    invitationContent: {
        flex: 1,
    },
    invitationName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    invitationHeadline: {
        fontSize: 13,
    },
    invitationActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    suggestionCard: {
        width: CARD_WIDTH,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    suggestionHeader: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: -10, // overlap avatar slightly or just spacing
        zIndex: 1,
    },
    closeSuggestion: {
        padding: 4,
        borderRadius: 10,
    },
    suggestionAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
        alignSelf: 'center',
        marginTop: 4,
    },
    suggestionInfo: {
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    suggestionName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    suggestionRole: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
        height: 32, // fixed height for 2 lines
    },
    suggestionMutual: {
        fontSize: 11,
        textAlign: 'center',
    },
    connectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        width: '100%',
        justifyContent: 'center',
    },
    connectBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
});
