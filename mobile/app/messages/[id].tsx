
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Send, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import Colors from '../../constants/Colors';
import api, { getImageUrl } from '../../services/api';

export default function ChatScreen() {
    const { id } = useLocalSearchParams(); // This is the partner ID
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { socket } = useSocket();
    const { startCall } = useCall();
    const activeColors = Colors[theme];
    const insets = useSafeAreaInsets();

    const [partner, setPartner] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch partner details and initial messages
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch partner profile
                const partnerRes = await api.get(`/network/users/${id}`);
                setPartner(partnerRes.data);

                // Fetch messages
                const msgRes = await api.get(`/messages/${id}`);
                setMessages(msgRes.data.reverse());
            } catch (error) {
                console.error("Chat init error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Socket connections
    useEffect(() => {
        if (!socket || !user) return;

        // Listener for new messages
        const handleNewMessage = (msg: any) => {
            console.log('Mobile Client received new_message:', msg);
            const msgPartnerId = msg.sender?._id || msg.sender?.id || msg.sender;
            const currentPartnerId = typeof id === 'string' ? id : id?.[0];

            if (String(msgPartnerId) === String(currentPartnerId) || (String(msg.recipient) === String(currentPartnerId))) {
                setMessages(prev => {
                    const exists = prev.some(m => m._id === msg._id);
                    if (exists) return prev;
                    return [msg, ...prev];
                });
            }
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, user, id]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const content = inputText.trim();
        setInputText('');

        try {
            const res = await api.post('/messages', {
                recipientId: id,
                content: content
            });
            // Add to list immediately
            setMessages(prev => [res.data, ...prev]);
        } catch (error) {
            console.error("Send error:", error);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = (item.sender._id || item.sender.id || item.sender) === (user?.id || user?._id);

        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.theirMessage,
                {
                    backgroundColor: isMe ? activeColors.tint : activeColors.card,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1
                }
            ]}>
                <Text style={[
                    styles.messageText,
                    { color: isMe ? '#fff' : activeColors.text }
                ]}>
                    {item.content}
                </Text>
                <Text style={[
                    styles.timeText,
                    { color: isMe ? 'rgba(255,255,255,0.7)' : activeColors.muted }
                ]}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: activeColors.card }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={24} color={activeColors.text} />
                    </TouchableOpacity>
                    {partner && (
                        <TouchableOpacity style={styles.headerInfo} onPress={() => router.push(('/profile/' + id) as any)}>
                            <Image
                                source={{ uri: getImageUrl(partner.avatar) || `https://ui-avatars.com/api/?name=${partner.firstName}+${partner.lastName}` }}
                                style={styles.avatar}
                            />
                            <View>
                                <Text style={[styles.headerName, { color: activeColors.text }]}>{partner.firstName} {partner.lastName}</Text>
                                <Text style={[styles.headerStatus, { color: activeColors.tint }]}>Active now</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => startCall(id as string, partner?.firstName || 'User', partner?.avatar, false)}>
                        <Phone size={20} color={activeColors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => startCall(id as string, partner?.firstName || 'User', partner?.avatar, true)}>
                        <Video size={20} color={activeColors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={activeColors.tint} />
                </View>
            ) : (
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id || Math.random().toString()}
                    inverted
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={[styles.inputWrapper, { backgroundColor: activeColors.background, paddingBottom: Math.max(insets.bottom, 10) }]}>
                    <View style={[styles.inputContainer, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                        <TextInput
                            style={[styles.input, { color: activeColors.text }]}
                            placeholder="Type a message..."
                            placeholderTextColor={activeColors.muted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? activeColors.tint : activeColors.border }]}
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                        >
                            <Send size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
        borderBottomColor: 'rgba(0,0,0,0.05)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 10,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    backBtn: { marginRight: 12, padding: 4 },
    headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12, borderWidth: 2, borderColor: '#fff' },
    headerName: { fontSize: 16, fontWeight: '700' },
    headerStatus: { fontSize: 12, fontWeight: '500' },
    iconBtn: { padding: 4 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 8,
    },
    myMessage: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: { fontSize: 15, lineHeight: 21 },
    timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end', opacity: 0.8 },
    inputWrapper: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 25,
        borderWidth: 1,
        padding: 5,
        minHeight: 50,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 15,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0, // Align with bottom
    },
});
