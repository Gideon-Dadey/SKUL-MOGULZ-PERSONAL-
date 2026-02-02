
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert, AppState, AppStateStatus } from 'react-native';
import { Phone, Video, X, PhoneOff, Mic, MicOff, Camera, CameraOff, PhoneCall } from 'lucide-react-native';
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
        partnerId: string;
        partnerName: string;
        partnerAvatar: string;
        isVideo: boolean;
        roomId: string;
    } | null>(null);

    // In-call controls state
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    // Call timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (callState === 'connected') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [callState]);

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
                    setIsVideoOff(!callInfo?.isVideo);
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
            setIsMuted(false);
            setIsVideoOff(false);
            setCallDuration(0);
        });

        return () => {
            socket.off('incoming_call');
            socket.off('call_status');
            socket.off('call_ended');
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
        setIsVideoOff(!isVideo);

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

        setCallState('connected');
        setIsVideoOff(!callInfo.isVideo);
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
        setIsMuted(false);
        setIsVideoOff(false);
        setCallDuration(0);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // In a real implementation, you would toggle the audio track here
    };

    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        // In a real implementation, you would toggle the video track here
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

            {/* CONNECTED CALL MODAL - Native Experience */}
            <Modal visible={callState === 'connected'} animationType="fade">
                <View style={styles.connectedScreen}>
                    {/* Call Header */}
                    <View style={styles.connectedHeader}>
                        <Image
                            source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/50' }}
                            style={styles.connectedAvatar}
                        />
                        <View>
                            <Text style={styles.connectedName}>{callInfo?.partnerName}</Text>
                            <Text style={styles.connectedTimer}>{formatDuration(callDuration)}</Text>
                        </View>
                    </View>

                    {/* Main Call Area */}
                    <View style={styles.callArea}>
                        {callInfo?.isVideo ? (
                            // Video call placeholder - in production, use react-native-webrtc
                            <View style={styles.videoPlaceholder}>
                                <Image
                                    source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150' }}
                                    style={styles.videoAvatarLarge}
                                />
                                <Text style={styles.videoCallText}>Video Call Active</Text>
                            </View>
                        ) : (
                            // Audio call UI
                            <View style={styles.audioCallArea}>
                                <Image
                                    source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150' }}
                                    style={styles.audioAvatar}
                                />
                                <Text style={styles.audioName}>{callInfo?.partnerName}</Text>
                                <Text style={styles.audioTimer}>{formatDuration(callDuration)}</Text>
                            </View>
                        )}
                    </View>

                    {/* Controls */}
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity
                            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                            onPress={toggleMute}
                        >
                            {isMuted ? <MicOff size={24} color="#fff" /> : <Mic size={24} color="#fff" />}
                            <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                        </TouchableOpacity>

                        {callInfo?.isVideo && (
                            <TouchableOpacity
                                style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
                                onPress={toggleVideo}
                            >
                                {isVideoOff ? <CameraOff size={24} color="#fff" /> : <Video size={24} color="#fff" />}
                                <Text style={styles.controlLabel}>{isVideoOff ? 'Video On' : 'Video Off'}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={[styles.controlBtn, styles.endCallBtn]} onPress={endCall}>
                            <PhoneOff size={28} color="#fff" />
                            <Text style={styles.controlLabel}>End</Text>
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

    // Connected call styles
    connectedScreen: { flex: 1, backgroundColor: '#1a1a2e' },
    connectedHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'rgba(0,0,0,0.5)', gap: 16 },
    connectedAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#A5D6B7' },
    connectedName: { fontSize: 18, fontWeight: '600', color: '#fff' },
    connectedTimer: { fontSize: 14, color: '#A5D6B7', fontWeight: '500' },

    callArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    videoPlaceholder: { alignItems: 'center' },
    videoAvatarLarge: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 3, borderColor: 'rgba(165, 214, 183, 0.5)' },
    videoCallText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },

    audioCallArea: { alignItems: 'center' },
    audioAvatar: { width: 180, height: 180, borderRadius: 90, marginBottom: 24, borderWidth: 4, borderColor: 'rgba(165, 214, 183, 0.5)', shadowColor: '#A5D6B7', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 10 },
    audioName: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
    audioTimer: { fontSize: 18, color: '#A5D6B7' },

    controlsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, padding: 24, paddingBottom: 40, backgroundColor: 'rgba(0,0,0,0.7)' },
    controlBtn: { alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
    controlBtnActive: { backgroundColor: '#ef4444' },
    controlLabel: { color: '#fff', fontSize: 10, marginTop: 4, fontWeight: '500' },
    endCallBtn: { backgroundColor: '#ef4444', width: 72, height: 72, borderRadius: 36 },
});
