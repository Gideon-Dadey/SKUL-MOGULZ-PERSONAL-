
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert, Linking, Platform } from 'react-native';
import { Phone, Video, X, PhoneOff, Mic, MicOff, Camera, CameraOff } from 'lucide-react-native';
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

    // Call State
    const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
    const [callInfo, setCallInfo] = useState<{
        partnerId: string; // Recipient ID (outgoing) OR Caller ID (incoming)
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
                partnerId: data.senderId, // The person calling ME
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
                    openCall(data.roomId, callInfo?.isVideo || false);
                    setCallState('idle'); // End in-app state, handoff to browser
                } else {
                    setCallState('idle');
                    const reason = data.reason === 'busy' ? 'User is on another call.' : 'The user declined the call.';
                    Alert.alert('Call Failed', reason);
                }
            }
        });

        return () => {
            socket.off('incoming_call');
            socket.off('call_status');
        };
    }, [socket, user, callState, callInfo]);

    const startCall = (recipientId: string, recipientName: string, recipientAvatar: string, isVideo: boolean) => {
        if (!socket || !user) return;

        // Create a highly unique Room ID for 1:1 privacy
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const roomId = `MogulCall-${user.id || user._id}-${recipientId}-${timestamp}-${random}`.replace(/[^a-zA-Z0-9-]/g, '');

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
            senderId: user.id || user._id,
            callerName: `${user.firstName} ${user.lastName}`,
            callerAvatar: user.avatar,
            isVideo,
            roomId
        });
    };

    const answerCall = () => {
        if (!socket || !callInfo) return;

        // Emit acceptance to the ORIGINAL CALLER (partnerId in incoming state)
        socket.emit('call_response', {
            callerId: callInfo.partnerId,
            accepted: true,
            roomId: callInfo.roomId
        });

        openCall(callInfo.roomId, callInfo.isVideo);
        setCallState('idle');
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

    const openCall = (roomId: string, isVideo: boolean, partnerName?: string) => {
        // Navigate to in-app call screen instead of opening external browser
        const router = require('expo-router').router;
        router.push({
            pathname: '/call',
            params: {
                roomId,
                partnerName: partnerName || callInfo?.partnerName || 'Unknown',
                isVideo: String(isVideo)
            }
        });
    };

    return (
        <CallContext.Provider value={{ startCall, endCall: rejectCall }}>
            {children}

            {/* INCOMING CALL MODAL */}
            <Modal visible={callState === 'incoming'} animationType="slide" transparent>
                <View style={styles.fullscreen}>
                    <Image
                        source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150' }}
                        style={styles.bgImage}
                        blurRadius={20}
                    />
                    <View style={styles.overlay} />

                    <View style={styles.callContent}>
                        <Image
                            source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150' }}
                            style={styles.avatarLarge}
                        />
                        <Text style={styles.callerName}>{callInfo?.partnerName}</Text>
                        <Text style={styles.callStatus}>Incoming {callInfo?.isVideo ? 'Video' : 'Audio'} Call...</Text>

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
                        <Image
                            source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150' }}
                            style={[styles.avatarLarge, { borderColor: '#A5D6B7' }]}
                        />
                        <Text style={styles.callerName}>{callInfo?.partnerName}</Text>
                        <Text style={styles.callStatus}>Calling...</Text>

                        <TouchableOpacity style={[styles.callBtn, styles.declineBtn, { marginTop: 60 }]} onPress={rejectCall}>
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
    avatarLarge: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 4, borderColor: '#fff' },
    callerName: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 8 },
    callStatus: { fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 40 },
    actionRow: { flexDirection: 'row', gap: 60, alignItems: 'center' },
    callBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    acceptBtn: { backgroundColor: '#4ade80' },
    declineBtn: { backgroundColor: '#ef4444' },
});
