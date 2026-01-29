
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../services/api';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ message: string, title: string, path?: string } | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const newSocket = io(BASE_URL, {
            transports: ['websocket'],
            forceNew: true
        });

        newSocket.on('connect', () => {
            console.log('Global Socket Connected');
            setIsConnected(true);
            newSocket.emit('join_room', user.id || user._id);
        });

        newSocket.on('disconnect', () => {
            console.log('Global Socket Disconnected');
            setIsConnected(false);
        });

        // Global Message Listener (for Toasts)
        newSocket.on('new_message', (msg: any) => {
            const senderId = msg.sender._id || msg.sender.id;
            // Don't show toast if currently viewing that chat
            const isOnChat = pathname && pathname.includes(`messages/${senderId}`);
            if (isOnChat) return;

            const senderName = `${msg.sender.firstName} ${msg.sender.lastName}`;
            showToast(senderName, msg.content, `/messages/${senderId}`);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user]);

    // Toast Logic
    const showToast = (title: string, message: string, path?: string) => {
        setToast({ title, message, path });
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
        }).start();

        setTimeout(() => {
            hideToast();
        }, 4000);
    };

    const hideToast = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start(() => setToast(null));
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
            {toast && (
                <Animated.View style={[
                    styles.toastContainer,
                    { opacity: fadeAnim, top: insets.top + (Platform.OS === 'ios' ? 10 : 20) }
                ]}>
                    <TouchableOpacity
                        style={styles.toastContent}
                        onPress={() => {
                            if (toast.path) {
                                router.push(toast.path as any);
                                hideToast();
                            }
                        }}
                    >
                        <View style={styles.toastInner}>
                            <View style={styles.indicator} />
                            <View style={styles.textContainer}>
                                <Text style={styles.toastTitle}>{toast.title}</Text>
                                <Text style={styles.toastMessage} numberOfLines={2}>{toast.message}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </SocketContext.Provider>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
        backgroundColor: '#1f2937',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    toastContent: {
        padding: 16,
    },
    toastInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    indicator: {
        width: 4,
        height: 40,
        backgroundColor: '#4ade80', // detailed green
        borderRadius: 2,
    },
    textContainer: {
        flex: 1,
    },
    toastTitle: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 2,
    },
    toastMessage: {
        color: '#d1d5db',
        fontSize: 13,
    }
});
