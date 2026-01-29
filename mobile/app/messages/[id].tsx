
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io } from 'socket.io-client';
import { Send, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import api, { BASE_URL, getImageUrl } from '../../services/api';

export default function ChatScreen() {
    const { id } = useLocalSearchParams(); // This is the partner ID
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const activeColors = Colors[theme];
    const insets = useSafeAreaInsets();

    const [partner, setPartner] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<any>(null);

    // Fetch partner details and initial messages
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch partner profile
                const partnerRes = await api.get(`/network/users/${id}`);
                setPartner(partnerRes.data);

                // Fetch messages
                const msgRes = await api.get(`/messages/${id}`);
                // API returns oldest first. We want inverted list (newest first).
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
        if (!user || !user.id && !user._id) return;

        socketRef.current = io(BASE_URL, {
            transports: ['websocket'],
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            const userId = user.id || user._id;
            socket.emit('join_room', userId);
        });

        socket.on('new_message', (msg: any) => {
            // Only add if it belongs to this conversation
            const msgPartnerId = msg.sender._id || msg.sender.id;
            const currentPartnerId = typeof id === 'string' ? id : id[0];

            // If I sent it (echo) or if partner sent it
            // Echo is usually handled optimistically or via response, but if we receive it via socket:
            // Check duplications carefully
            setMessages(prev => {
                const exists = prev.some(m => (m._id === msg._id && m._id));
                if (exists) return prev;
                return [msg, ...prev];
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [user, id]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const content = inputText.trim();
        setInputText('');

        try {
            const res = await api.post('/messages', {
                recipientId: id,
                content: content
            });
            // Add to list immediately (optimistic or robust via response)
            // Response 'res.data' is the message object
            setMessages(prev => [res.data, ...prev]);
        } catch (error) {
            console.error("Send error:", error);
            // Ideally show error toast
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = (item.sender._id || item.sender.id || item.sender) === (user?.id || user?._id);

        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.theirMessage,
                { backgroundColor: isMe ? activeColors.tint : activeColors.card }
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
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: activeColors.border, backgroundColor: activeColors.card }]}>
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
                            <Text style={[styles.headerStatus, { color: activeColors.muted }]}>Active now</Text>
                        </View>
                    </TouchableOpacity>
                )}
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
                <View style={[styles.inputContainer, { backgroundColor: activeColors.card, paddingBottom: Math.max(insets.bottom, 12) }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: activeColors.background, color: activeColors.text }]}
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
                        <Send size={20} color="#fff" />
                    </TouchableOpacity>
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
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        elevation: 2,
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    backBtn: { marginRight: 12, padding: 4 },
    headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    headerName: { fontSize: 16, fontWeight: '700' },
    headerStatus: { fontSize: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
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
    messageText: { fontSize: 15, lineHeight: 20 },
    timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        marginRight: 10,
        fontSize: 15,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
