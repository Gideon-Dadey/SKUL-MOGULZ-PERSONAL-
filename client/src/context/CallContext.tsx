
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { getImageUrl } from '../services/api';
import { Phone, X, PhoneOff, Mic, MicOff, Video, VideoOff, Camera, PhoneCall } from 'lucide-react';

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
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

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

    // Initialize WebRTC Peer Connection
    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && socket && callInfo) {
                socket.emit('ice_candidate', {
                    candidate: event.candidate,
                    recipientId: callInfo.partnerId
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('Received remote track');
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteStreamRef.current = event.streams[0];
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
            const stream = await navigator.mediaDevices.getUserMedia({
                video: isVideo,
                audio: true
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Could not access camera/microphone. Please check permissions.');
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
                        stream.getTracks().forEach(track => pc.addTrack(track, stream));
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('webrtc_offer', {
                            offer,
                            recipientId: callInfo.partnerId
                        });
                    }
                    setCallState('connected');
                    setIsVideoOff(!callInfo.isVideo);
                } else {
                    setCallState('idle');
                    const reason = data.reason === 'busy' ? 'User is on another call.' : 'The user declined the call.';
                    alert(`Call Failed: ${reason}`);
                }
            }
        });

        // Handle incoming WebRTC offer
        socket.on('webrtc_offer', async (data: any) => {
            if (callInfo) {
                const pc = peerConnectionRef.current || createPeerConnection();
                const stream = await getUserMedia(callInfo.isVideo);
                if (stream) {
                    stream.getTracks().forEach(track => pc.addTrack(track, stream));
                }
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', {
                    answer,
                    recipientId: data.senderId
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
        const userId = (user as any)?._id || user?.id;
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
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach(track => track.stop());
            remoteStreamRef.current = null;
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
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = isMuted;
                setIsMuted(!isMuted);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = isVideoOff;
                setIsVideoOff(!isVideoOff);
            }
        }
    };

    const switchCamera = async () => {
        if (!localStreamRef.current || !callInfo?.isVideo) return;

        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            const currentFacing = (videoTrack.getSettings() as any).facingMode;
            const newFacing = currentFacing === 'user' ? 'environment' : 'user';

            try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: newFacing },
                    audio: false
                });

                const newVideoTrack = newStream.getVideoTracks()[0];
                const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    await sender.replaceTrack(newVideoTrack);
                }

                // Update local video
                videoTrack.stop();
                localStreamRef.current.removeTrack(videoTrack);
                localStreamRef.current.addTrack(newVideoTrack);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = localStreamRef.current;
                }
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
            {callState === 'incoming' && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={bgBlurStyle(getImageUrl(callInfo?.partnerAvatar))}></div>
                        <div style={contentStyle}>
                            <div style={incomingIconContainer}>
                                <PhoneCall size={40} color="#4ade80" style={{ animation: 'pulse 1.5s infinite' }} />
                            </div>
                            <img
                                src={getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150'}
                                style={avatarStyle}
                                alt="Caller"
                            />
                            <h2 style={nameStyle}>{callInfo?.partnerName}</h2>
                            <p style={statusStyle}>Incoming {callInfo?.isVideo ? 'Video' : 'Voice'} Call</p>

                            <div style={actionRowStyle}>
                                <button style={{ ...btnStyle, ...declineBtnStyle }} onClick={rejectCall}>
                                    <PhoneOff size={32} color="#fff" />
                                </button>
                                <button style={{ ...btnStyle, ...acceptBtnStyle }} onClick={answerCall}>
                                    <Phone size={32} color="#fff" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OUTGOING CALL MODAL */}
            {callState === 'calling' && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ ...bgBlurStyle(getImageUrl(callInfo?.partnerAvatar)), opacity: 0.3 }}></div>
                        <div style={contentStyle}>
                            <div style={pulsingRing}></div>
                            <img
                                src={getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150'}
                                style={{ ...avatarStyle, position: 'relative', zIndex: 2 }}
                                alt="Recipient"
                            />
                            <h2 style={nameStyle}>{callInfo?.partnerName}</h2>
                            <p style={statusStyle}>Calling...</p>

                            <button style={{ ...btnStyle, ...declineBtnStyle, marginTop: '40px' }} onClick={endCall}>
                                <X size={32} color="#fff" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONNECTED CALL - Native WebRTC Experience */}
            {callState === 'connected' && callInfo && (
                <div style={connectedOverlayStyle}>
                    {/* Call Header */}
                    <div style={callHeaderStyle}>
                        <div style={callHeaderInfo}>
                            <img
                                src={getImageUrl(callInfo.partnerAvatar) || 'https://via.placeholder.com/50'}
                                style={callHeaderAvatar}
                                alt=""
                            />
                            <div>
                                <h3 style={callHeaderName}>{callInfo.partnerName}</h3>
                                <p style={callHeaderTimer}>{formatDuration(callDuration)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Video Container */}
                    <div style={videoContainerStyle}>
                        {/* Remote Video (Full screen) */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={remoteVideoStyle}
                        />

                        {/* Local Video (Picture-in-Picture) */}
                        {callInfo.isVideo && (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                style={localVideoStyle}
                            />
                        )}

                        {/* Audio-only indicator */}
                        {!callInfo.isVideo && (
                            <div style={audioOnlyStyle}>
                                <img
                                    src={getImageUrl(callInfo.partnerAvatar) || 'https://via.placeholder.com/150'}
                                    style={audioAvatarStyle}
                                    alt=""
                                />
                                <h2 style={audioNameStyle}>{callInfo.partnerName}</h2>
                                <p style={audioTimerStyle}>{formatDuration(callDuration)}</p>
                            </div>
                        )}
                    </div>

                    {/* Custom Controls */}
                    <div style={controlsContainerStyle}>
                        <button
                            style={{ ...controlBtnStyle, backgroundColor: isMuted ? '#ef4444' : 'rgba(255,255,255,0.15)' }}
                            onClick={toggleMute}
                        >
                            {isMuted ? <MicOff size={24} color="#fff" /> : <Mic size={24} color="#fff" />}
                            <span style={controlLabelStyle}>{isMuted ? 'Unmute' : 'Mute'}</span>
                        </button>

                        {callInfo.isVideo && (
                            <>
                                <button
                                    style={{ ...controlBtnStyle, backgroundColor: isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.15)' }}
                                    onClick={toggleVideo}
                                >
                                    {isVideoOff ? <VideoOff size={24} color="#fff" /> : <Video size={24} color="#fff" />}
                                    <span style={controlLabelStyle}>{isVideoOff ? 'Video On' : 'Video Off'}</span>
                                </button>

                                <button
                                    style={{ ...controlBtnStyle, backgroundColor: 'rgba(255,255,255,0.15)' }}
                                    onClick={switchCamera}
                                >
                                    <Camera size={24} color="#fff" />
                                    <span style={controlLabelStyle}>Flip</span>
                                </button>
                            </>
                        )}

                        <button style={{ ...controlBtnStyle, ...endCallBtnStyle }} onClick={endCall}>
                            <PhoneOff size={28} color="#fff" />
                            <span style={controlLabelStyle}>End</span>
                        </button>
                    </div>

                    {/* Pulsing animation styles */}
                    <style>{`
                        @keyframes pulse {
                            0%, 100% { opacity: 1; transform: scale(1); }
                            50% { opacity: 0.5; transform: scale(1.1); }
                        }
                        @keyframes ring {
                            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
                            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                        }
                    `}</style>
                </div>
            )}
        </CallContext.Provider>
    );
};

// Styles
const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
};

const connectedOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#1a1a2e', zIndex: 10000,
    display: 'flex', flexDirection: 'column'
};

const modalStyle: React.CSSProperties = {
    position: 'relative', width: '100%', height: '100%',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden'
};

const bgBlurStyle = (url?: string | null): React.CSSProperties => ({
    position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%',
    backgroundImage: `url(${url || 'https://via.placeholder.com/150'})`,
    backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'blur(40px) brightness(0.4)', zIndex: 0
});

const contentStyle: React.CSSProperties = {
    position: 'relative', zIndex: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    color: '#fff', textAlign: 'center'
};

const incomingIconContainer: React.CSSProperties = {
    marginBottom: '24px'
};

const avatarStyle: React.CSSProperties = {
    width: '140px', height: '140px', borderRadius: '50%',
    objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)', marginBottom: '24px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
};

const pulsingRing: React.CSSProperties = {
    position: 'absolute', width: '160px', height: '160px', borderRadius: '50%',
    border: '3px solid #4ade80', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', zIndex: 1,
    animation: 'ring 1.5s ease-out infinite'
};

const nameStyle: React.CSSProperties = {
    fontSize: '28px', fontWeight: 700, marginBottom: '8px',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
};

const statusStyle: React.CSSProperties = {
    fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '48px'
};

const actionRowStyle: React.CSSProperties = {
    display: 'flex', gap: '48px'
};

const btnStyle: React.CSSProperties = {
    width: '72px', height: '72px', borderRadius: '50%',
    border: 'none', cursor: 'pointer',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    transition: 'all 0.2s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
};

const acceptBtnStyle: React.CSSProperties = { backgroundColor: '#4ade80' };
const declineBtnStyle: React.CSSProperties = { backgroundColor: '#ef4444' };

// Connected call styles
const callHeaderStyle: React.CSSProperties = {
    padding: '16px 24px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    zIndex: 10
};

const callHeaderInfo: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '16px'
};

const callHeaderAvatar: React.CSSProperties = {
    width: '44px', height: '44px', borderRadius: '50%',
    objectFit: 'cover', border: '2px solid #A5D6B7'
};

const callHeaderName: React.CSSProperties = {
    color: '#fff', fontSize: '16px', fontWeight: 600, margin: 0
};

const callHeaderTimer: React.CSSProperties = {
    color: '#A5D6B7', fontSize: '13px', margin: 0, fontWeight: 500
};

const videoContainerStyle: React.CSSProperties = {
    flex: 1, position: 'relative', backgroundColor: '#0a0a0a', overflow: 'hidden'
};

const remoteVideoStyle: React.CSSProperties = {
    width: '100%', height: '100%', objectFit: 'cover'
};

const localVideoStyle: React.CSSProperties = {
    position: 'absolute', bottom: '20px', right: '20px',
    width: '160px', height: '120px', borderRadius: '12px',
    objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 10
};

const audioOnlyStyle: React.CSSProperties = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    zIndex: 5
};

const audioAvatarStyle: React.CSSProperties = {
    width: '180px', height: '180px', borderRadius: '50%',
    objectFit: 'cover', border: '4px solid rgba(165, 214, 183, 0.5)',
    boxShadow: '0 0 60px rgba(165, 214, 183, 0.3)', marginBottom: '24px'
};

const audioNameStyle: React.CSSProperties = {
    color: '#fff', fontSize: '28px', fontWeight: 700, margin: 0, marginBottom: '8px'
};

const audioTimerStyle: React.CSSProperties = {
    color: '#A5D6B7', fontSize: '18px', margin: 0
};

const controlsContainerStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '20px', padding: '20px',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTop: '1px solid rgba(255,255,255,0.1)'
};

const controlBtnStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', width: '64px', height: '64px',
    borderRadius: '50%', border: 'none', cursor: 'pointer',
    transition: 'all 0.2s ease'
};

const controlLabelStyle: React.CSSProperties = {
    color: '#fff', fontSize: '10px', marginTop: '4px', fontWeight: 500
};

const endCallBtnStyle: React.CSSProperties = {
    backgroundColor: '#ef4444', width: '72px', height: '72px'
};
