
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { Phone, Video, X, PhoneOff, PhoneCall } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { getImageUrl } from '../services/api';

interface CallContextType {
    startCall: (recipientId: string, recipientName: string, recipientAvatar: string, isVideo: boolean) => void;
    endCall: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within CallProvider');
    return context;
};

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const router = useRouter();

    // Call State
    const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
    const [callInfo, setCallInfo] = useState<{
        partnerId: string;
        partnerName: string;
        partnerAvatar: string;
        isVideo: boolean;
        roomId: string;
    } | null>(null);

    useEffect(() => {
        if (!socket || !user) return;

        // Listen for Incoming Calls
        socket.on('incoming_call', (data: any) => {
            if (callState !== 'idle') {
                // Return 'busy' status
                socket.emit('call_response', {
                    callerId: data.senderId,
                    accepted: false,
                    reason: 'busy'
                });
                return;
            }

            setCallInfo({
                partnerId: data.senderId,
                partnerName: data.callerName,
                partnerAvatar: data.callerAvatar,
                isVideo: data.isVideo,
                roomId: data.roomId
            });
            setCallState('incoming');
        });

        // Listen for Call Response (Answered/Rejected/Busy)
        socket.on('call_status', (data: any) => {
            if (callState === 'calling') {
                if (data.accepted) {
                    setCallState('connected');
                    openCallScreen(data.roomId, callInfo?.isVideo || false, callInfo?.partnerName || 'Unknown');
                } else {
                    setCallState('idle');
                    const reason = data.reason === 'busy' ? 'User is on another call.' : 'The user declined the call.';
                    Alert.alert('Call Failed', reason);
                }
            }
        });

        // Handle call ended by other party
        socket.on('call_ended', () => {
            setCallState('idle');
            setCallInfo(null);
            router.back();
        });

        return () => {
            socket.off('incoming_call');
            socket.off('call_status');
            socket.off('call_ended');
        };
    }, [socket, user, callState, callInfo]);

    const startCall = (recipientId: string, recipientName: string, recipientAvatar: string, isVideo: boolean) => {
        if (!socket || !user) return;

        // Create a unique Room ID
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const userId = (user as any)?.id || (user as any)?._id;
        const roomId = `MogulCall-${userId}-${recipientId}-${timestamp}-${random}`.replace(/[^a-zA-Z0-9-]/g, '');

        setCallInfo({
            partnerId: recipientId,
            partnerName: recipientName,
            partnerAvatar: recipientAvatar,
            isVideo,
            roomId
        });
        setCallState('calling');

        // Emit call start
        socket.emit('call_start', {
            recipientId,
            senderId: userId,
            callerName: `${user.firstName} ${user.lastName}`,
            callerAvatar: user.avatar,
            isVideo,
            roomId
        });
    };

    const answerCall = () => {
        if (!socket || !callInfo) return;

        // Emit acceptance
        socket.emit('call_response', {
            callerId: callInfo.partnerId,
            accepted: true,
            roomId: callInfo.roomId
        });

        setCallState('connected');
        openCallScreen(callInfo.roomId, callInfo.isVideo, callInfo.partnerName);
    };

    const rejectCall = () => {
        if (!socket || !callInfo) return;
        socket.emit('call_response', {
            callerId: callInfo.partnerId,
            accepted: false
        });
        setCallState('idle');
        setCallInfo(null);
    };

    const endCall = () => {
        if (socket && callInfo) {
            socket.emit('call_ended', { recipientId: callInfo.partnerId });
        }
        setCallState('idle');
        setCallInfo(null);
    };

    const openCallScreen = (roomId: string, isVideo: boolean, partnerName: string) => {
        // Navigate to the call screen which uses WebView (Jitsi)
        router.push({
            pathname: '/call',
            params: {
                roomId,
                partnerName,
                isVideo: String(isVideo)
            }
        });
        // Reset state after navigation (call.tsx handles its own state mostly)
        setTimeout(() => {
            setCallState('idle');
            setCallInfo(null);
        }, 1000);
    };

    return (
        <CallContext.Provider value={{ startCall, endCall }}>
            {children}

            {/* INCOMING CALL MODAL */}
            <Modal visible={callState === 'incoming'} animationType="slide" transparent>
                <View style={styles.fullscreen}>
                    <Image
                        source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150' }}
                        style={styles.bgImage}
                        blurRadius={25}
                    />
                    <View style={styles.overlay} />

                    <View style={styles.callContent}>
                        <PhoneCall size={40} color="#4ade80" style={{ marginBottom: 20 }} />
                        <Image
                            source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150' }}
                            style={styles.avatarLarge}
                        />
                        <Text style={styles.callerName}>{callInfo?.partnerName}</Text>
                        <Text style={styles.callStatus}>Incoming {callInfo?.isVideo ? 'Video' : 'Voice'} Call</Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.callBtn, styles.declineBtn]} onPress={rejectCall}>
                                <PhoneOff size={32} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.callBtn, styles.acceptBtn]} onPress={answerCall}>
                                <Phone size={32} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* OUTGOING CALL MODAL */}
            <Modal visible={callState === 'calling'} animationType="fade" transparent>
                <View style={styles.fullscreen}>
                    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]} />
                    <View style={styles.callContent}>
                        <View style={styles.pulsingContainer}>
                            <View style={styles.pulsingRing} />
                            <Image
                                source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150' }}
                                style={[styles.avatarLarge, { borderColor: '#A5D6B7' }]}
                            />
                        </View>
                        <Text style={styles.callerName}>{callInfo?.partnerName}</Text>
                        <Text style={styles.callStatus}>Calling...</Text>

                        <TouchableOpacity style={[styles.callBtn, styles.declineBtn, { marginTop: 60 }]} onPress={endCall}>
                            <X size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </CallContext.Provider>
    );
};

const styles = StyleSheet.create({
    fullscreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    bgImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    callContent: { alignItems: 'center', zIndex: 10, width: '100%' },
    avatarLarge: { width: 140, height: 140, borderRadius: 70, marginBottom: 24, borderWidth: 4, borderColor: '#fff' },
    pulsingContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    pulsingRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: '#A5D6B7', opacity: 0.5 },
    callerName: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
    callStatus: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 48 },
    actionRow: { flexDirection: 'row', gap: 48, alignItems: 'center' },
    callBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    acceptBtn: { backgroundColor: '#4ade80' },
    declineBtn: { backgroundColor: '#ef4444' },
});
