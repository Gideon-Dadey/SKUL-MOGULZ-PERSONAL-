import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Pressable
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';
import notificationService from '../../services/notificationService';
import { Notification } from '../../types';
import { getImageUrl } from '../../services/api';
import { Bell, Heart, MessageSquareText, UserPlus, Zap, CheckCheck, MoreVertical, Repeat } from 'lucide-react-native';
import { formatRelativeTime } from '../../utils/date';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../../context/SocketContext';

import { useNotifications } from '../../context/NotificationContext';

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const activeColors = Colors[theme];
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { markAllAsRead, markAsRead } = useNotifications();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { socket } = useSocket();

    const fetchNotifications = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchNotifications(false);
            // Mark all as read when viewed
            const autoMark = async () => {
                try {
                    await markAllAsRead();
                    // Update local state to reflect read status immediately
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                } catch (e) {
                    console.error("Auto mark all read failed", e);
                }
            };
            autoMark();
        }, [fetchNotifications, markAllAsRead])
    );

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: any) => {
            setNotifications(prev => [notification, ...prev]);
        };

        socket.on('notification', handleNewNotification);
        return () => {
            socket.off('notification', handleNewNotification);
        };
    }, [socket]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchNotifications(false);
    };

    const handleMarkAsRead = async (id: string, isRead: boolean, type?: string, targetId?: string) => {
        // Mark as read in background if not already read
        if (!isRead) {
            try {
                await markAsRead(id);
                setNotifications(prev =>
                    prev.map(n => n._id === id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error("Failed to mark as read", error);
            }
        }

        // Navigate based on type
        if (type) {
            if (['like', 'comment', 'funding', 'repost'].includes(type) && targetId) {
                router.push(`/post/${targetId}`);
            } else if (type === 'follow' && targetId) {
                router.push(`/profile/${targetId}`);
            }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const getNotificationIcon = (type: string) => {
        const iconSize = 14;
        switch (type) {
            case 'like': return <Heart size={iconSize} color="#FF4B2B" fill="#FF4B2B" />;
            case 'comment': return <MessageSquareText size={iconSize} color="#00C9FF" fill="#00C9FF" />;
            case 'funding': return <Zap size={iconSize} color="#FDC830" fill="#FDC830" />;
            case 'follow': return <UserPlus size={iconSize} color="#A5D6B7" fill="#A5D6B7" />;
            case 'repost': return <Repeat size={iconSize} color="#00BA7C" />;
            default: return <Bell size={iconSize} color={activeColors.muted} />;
        }
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        return (
            <Pressable
                style={[
                    styles.notifItem,
                    { backgroundColor: item.isRead ? 'transparent' : activeColors.background + '40' }
                ]}
                onPress={() => {
                    const targetId = item.project?._id ||
                        (typeof item.project === 'string' ? item.project : null) ||
                        item.sender?._id ||
                        item.sender?.id;
                    handleMarkAsRead(item._id, item.isRead, item.type, targetId);
                }}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={{
                            uri: getImageUrl(item.sender?.avatar) ||
                                `https://ui-avatars.com/api/?name=${item.sender?.firstName}+${item.sender?.lastName}&background=A5D6B7&color=fff`
                        }}
                        style={styles.avatar}
                    />
                    <View style={[styles.typeOverlay, { backgroundColor: activeColors.card }]}>
                        {getNotificationIcon(item.type)}
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={[styles.message, { color: activeColors.text }]}>
                        <Text style={styles.senderName}>{item.sender?.firstName} {item.sender?.lastName}</Text>
                        {' '}
                        {item.content ? item.content :
                            (item.type === 'like' ? 'liked your project' :
                                item.type === 'comment' ? 'commented on your project' :
                                    item.type === 'funding' ? 'supported your project' :
                                        item.type === 'repost' ? 'reposted your project' :
                                            item.type === 'follow' ? 'followed you' :
                                                'sent you a notification')
                        }
                        {item.project && !item.content && (
                            <Text style={[styles.projectTitle, { color: activeColors.tint }]}>: "{item.project.title}"</Text>
                        )}
                    </Text>
                    <Text style={[styles.time, { color: activeColors.muted }]}>
                        {formatRelativeTime(item.createdAt)}
                    </Text>
                </View>

                {!item.isRead && (
                    <View style={[styles.unreadDot, { backgroundColor: activeColors.tint }]} />
                )}

                <TouchableOpacity style={styles.moreButton}>
                    <MoreVertical size={18} color={activeColors.muted} />
                </TouchableOpacity>
            </Pressable>
        );
    };

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: activeColors.card }]}>
            <View style={styles.headerTop}>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Alerts</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                    <CheckCheck size={24} color={activeColors.tint} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Bell size={64} color={activeColors.muted} strokeWidth={1} />
            <Text style={[styles.emptyTitle, { color: activeColors.text }]}>No notifications yet</Text>
            <Text style={[styles.emptySubtitle, { color: activeColors.muted }]}>
                Stay updated on likes, comments, and project milestones.
            </Text>
        </View>
    );

    if (isLoading && !isRefreshing) {
        return (
            <View style={[styles.container, { backgroundColor: activeColors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={activeColors.tint} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            {renderHeader()}
            <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={item => item._id}
                contentContainerStyle={[
                    styles.listContent,
                    notifications.length === 0 && { flex: 1, justifyContent: 'center' }
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={activeColors.tint}
                    />
                }
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 100,
    },
    notifItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    typeOverlay: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 4,
    },
    senderName: {
        fontWeight: '700',
    },
    projectTitle: {
        fontWeight: '600',
        fontStyle: 'italic',
    },
    time: {
        fontSize: 13,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    moreButton: {
        padding: 8,
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
});
