
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Alert, Platform } from 'react-native';
import { Phone, Video, X, PhoneOff, Mic, MicOff, Camera, CameraOff, PhoneCall, RefreshCw } from 'lucide-react-native';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { getImageUrl } from '../services/api';
import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    mediaDevices,
    RTCView,
    MediaStream,
} from 'react-native-webrtc';

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

// ICE Servers for WebRTC (free STUN servers)
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const { user } = useAuth();

    // Refs for WebRTC
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);

    // Call State
    const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
    const [callInfo, setCallInfo] = useState<{
        partnerId: string;
        partnerName: string;
        partnerAvatar: string;
        isVideo: boolean;
        roomId: string;
    } | null>(null);

    // Stream states for rendering
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    // In-call controls state
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isFrontCamera, setIsFrontCamera] = useState(true);
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

    // Initialize WebRTC Peer Connection
    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event: any) => {
            if (event.candidate && socket && callInfo) {
                socket.emit('ice_candidate', {
                    candidate: event.candidate,
                    recipientId: callInfo.partnerId
                });
            }
        };

        pc.ontrack = (event: any) => {
            console.log('Received remote track');
            if (event.streams && event.streams[0]) {
                remoteStreamRef.current = event.streams[0];
                setRemoteStream(event.streams[0]);
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('Connection state:', pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                endCall();
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    // Get user media (camera/mic)
    const getUserMedia = async (isVideo: boolean) => {
        try {
            const constraints: any = {
                audio: true,
                video: isVideo ? {
                    facingMode: isFrontCamera ? 'user' : 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } : false
            };

            const stream = await mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            Alert.alert('Permission Error', 'Could not access camera/microphone. Please check permissions.');
            return null;
        }
    };

    // Socket event handlers for WebRTC signaling
    useEffect(() => {
        if (!socket || !user) return;

        // Listen for Incoming Calls
        socket.on('incoming_call', (data: any) => {
            if (callState !== 'idle') {
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

        // Listen for Call Response
        socket.on('call_status', async (data: any) => {
            if (callState === 'calling' && callInfo) {
                if (data.accepted) {
                    // They answered - create offer
                    const pc = createPeerConnection();
                    const stream = await getUserMedia(callInfo.isVideo);
                    if (stream) {
                        stream.getTracks().forEach((track: any) => {
                            pc.addTrack(track, stream);
                        });
                        const offer = await pc.createOffer({});
                        await pc.setLocalDescription(offer);
                        socket.emit('webrtc_offer', {
                            offer: offer,
                            recipientId: callInfo.partnerId
                        });
                    }
                    setCallState('connected');
                    setIsVideoOff(!callInfo.isVideo);
                } else {
                    setCallState('idle');
                    const reason = data.reason === 'busy' ? 'User is on another call.' : 'The user declined the call.';
                    Alert.alert('Call Failed', reason);
                }
            }
        });

        // Handle incoming WebRTC offer
        socket.on('webrtc_offer', async (data: any) => {
            if (callInfo) {
                const pc = peerConnectionRef.current || createPeerConnection();
                const stream = await getUserMedia(callInfo.isVideo);
                if (stream) {
                    stream.getTracks().forEach((track: any) => {
                        pc.addTrack(track, stream);
                    });
                }
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', {
                    answer: answer,
                    recipientId: callInfo.partnerId
                });
            }
        });

        // Handle incoming WebRTC answer
        socket.on('webrtc_answer', async (data: any) => {
            const pc = peerConnectionRef.current;
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        // Handle ICE candidates
        socket.on('ice_candidate', async (data: any) => {
            const pc = peerConnectionRef.current;
            if (pc && data.candidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (error) {
                    console.error('Error adding ICE candidate:', error);
                }
            }
        });

        // Handle call ended by other party
        socket.on('call_ended', () => {
            cleanupCall();
            setCallState('idle');
            setCallInfo(null);
        });

        return () => {
            socket.off('incoming_call');
            socket.off('call_status');
            socket.off('webrtc_offer');
            socket.off('webrtc_answer');
            socket.off('ice_candidate');
            socket.off('call_ended');
        };
    }, [socket, user, callState, callInfo]);

    const startCall = (recipientId: string, recipientName: string, recipientAvatar: string, isVideo: boolean) => {
        if (!socket || !user) return;

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
        setIsVideoOff(!isVideo);

        socket.emit('call_start', {
            recipientId,
            senderId: userId,
            callerName: `${user.firstName} ${user.lastName}`,
            callerAvatar: user.avatar,
            isVideo,
            roomId
        });
    };

    const answerCall = async () => {
        if (!socket || !callInfo) return;

        socket.emit('call_response', {
            callerId: callInfo.partnerId,
            accepted: true,
            roomId: callInfo.roomId
        });

        // Setup peer connection for receiving
        createPeerConnection();
        await getUserMedia(callInfo.isVideo);

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

    const cleanupCall = () => {
        // Stop all tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track: any) => track.stop());
            localStreamRef.current = null;
            setLocalStream(null);
        }
        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach((track: any) => track.stop());
            remoteStreamRef.current = null;
            setRemoteStream(null);
        }
        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    };

    const endCall = () => {
        if (socket && callInfo) {
            socket.emit('call_ended', { recipientId: callInfo.partnerId });
        }
        cleanupCall();
        setCallState('idle');
        setCallInfo(null);
        setIsMuted(false);
        setIsVideoOff(false);
        setCallDuration(0);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            audioTracks.forEach((track: any) => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTracks = localStreamRef.current.getVideoTracks();
            videoTracks.forEach((track: any) => {
                track.enabled = isVideoOff;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const switchCamera = async () => {
        if (!localStreamRef.current || !callInfo?.isVideo) return;

        const videoTracks = localStreamRef.current.getVideoTracks();
        if (videoTracks.length > 0) {
            // Stop current video track
            videoTracks.forEach((track: any) => track.stop());

            // Get new stream with opposite camera
            const newFacing = !isFrontCamera;
            setIsFrontCamera(newFacing);

            try {
                const newStream = await mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: newFacing ? 'user' : 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });

                const newVideoTrack = newStream.getVideoTracks()[0];

                // Replace track in peer connection
                const sender = peerConnectionRef.current?.getSenders().find(
                    (s: any) => s.track?.kind === 'video'
                );
                if (sender) {
                    await sender.replaceTrack(newVideoTrack);
                }

                // Update local stream
                localStreamRef.current.removeTrack(videoTracks[0]);
                localStreamRef.current.addTrack(newVideoTrack);
                setLocalStream(localStreamRef.current);
            } catch (error) {
                console.error('Error switching camera:', error);
            }
        }
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

            {/* CONNECTED CALL MODAL - Full WebRTC */}
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

                    {/* Video/Audio Area */}
                    <View style={styles.callArea}>
                        {callInfo?.isVideo ? (
                            <>
                                {/* Remote Video (Full screen) */}
                                {remoteStream && (
                                    <RTCView
                                        streamURL={remoteStream.toURL()}
                                        style={styles.remoteVideo}
                                        objectFit="cover"
                                        mirror={false}
                                    />
                                )}

                                {/* Local Video (Picture-in-Picture) */}
                                {localStream && !isVideoOff && (
                                    <View style={styles.localVideoContainer}>
                                        <RTCView
                                            streamURL={localStream.toURL()}
                                            style={styles.localVideo}
                                            objectFit="cover"
                                            mirror={isFrontCamera}
                                            zOrder={1}
                                        />
                                    </View>
                                )}

                                {/* Placeholder when no remote video yet */}
                                {!remoteStream && (
                                    <View style={styles.videoPlaceholder}>
                                        <Image
                                            source={{ uri: getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150' }}
                                            style={styles.videoAvatarLarge}
                                        />
                                        <Text style={styles.videoCallText}>Connecting video...</Text>
                                    </View>
                                )}
                            </>
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
                            <>
                                <TouchableOpacity
                                    style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
                                    onPress={toggleVideo}
                                >
                                    {isVideoOff ? <CameraOff size={24} color="#fff" /> : <Video size={24} color="#fff" />}
                                    <Text style={styles.controlLabel}>{isVideoOff ? 'Video On' : 'Video Off'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.controlBtn}
                                    onPress={switchCamera}
                                >
                                    <RefreshCw size={24} color="#fff" />
                                    <Text style={styles.controlLabel}>Flip</Text>
                                </TouchableOpacity>
                            </>
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
    connectedHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'rgba(0,0,0,0.6)', gap: 16, zIndex: 10 },
    connectedAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#A5D6B7' },
    connectedName: { fontSize: 18, fontWeight: '600', color: '#fff' },
    connectedTimer: { fontSize: 14, color: '#A5D6B7', fontWeight: '500' },

    callArea: { flex: 1, backgroundColor: '#0a0a0a' },

    remoteVideo: { flex: 1, width: '100%', height: '100%' },
    localVideoContainer: { position: 'absolute', bottom: 100, right: 20, width: 120, height: 160, borderRadius: 12, overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', elevation: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10 },
    localVideo: { width: '100%', height: '100%' },

    videoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    videoAvatarLarge: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 3, borderColor: 'rgba(165, 214, 183, 0.5)' },
    videoCallText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },

    audioCallArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    audioAvatar: { width: 180, height: 180, borderRadius: 90, marginBottom: 24, borderWidth: 4, borderColor: 'rgba(165, 214, 183, 0.5)', shadowColor: '#A5D6B7', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 10 },
    audioName: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
    audioTimer: { fontSize: 18, color: '#A5D6B7' },

    controlsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, padding: 20, paddingBottom: 40, backgroundColor: 'rgba(0,0,0,0.8)' },
    controlBtn: { alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
    controlBtnActive: { backgroundColor: '#ef4444' },
    controlLabel: { color: '#fff', fontSize: 10, marginTop: 4, fontWeight: '500' },
    endCallBtn: { backgroundColor: '#ef4444', width: 72, height: 72, borderRadius: 36 },
});
