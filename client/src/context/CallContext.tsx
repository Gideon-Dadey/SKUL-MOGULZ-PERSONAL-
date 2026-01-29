
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { getImageUrl } from '../services/api';
import { Phone, X, PhoneOff } from 'lucide-react';

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
            if (callState !== 'idle') return; // Busy

            setCallInfo({
                partnerId: data.senderId, // The person calling ME
                partnerName: data.callerName,
                partnerAvatar: data.callerAvatar,
                isVideo: data.isVideo,
                roomId: data.roomId
            });
            setCallState('incoming');
        });

        // Listen for Call Response (Answered/Rejected)
        socket.on('call_status', (data: any) => {
            if (callState === 'calling') {
                if (data.accepted) {
                    setCallState('connected');
                    openMeeting(data.roomId);
                    setCallState('idle');
                } else {
                    setCallState('idle');
                    alert('Call Declined: The user is busy or declined the call.');
                }
            }
        });

        return () => {
            socket.off('incoming_call');
            socket.off('call_status');
        };
    }, [socket, user, callState]);

    const startCall = (recipientId: string, recipientName: string, recipientAvatar: string, isVideo: boolean) => {
        if (!socket || !user) return;

        const roomId = `SkulMogulz-${Math.floor(Math.random() * 1000000)}`;
        setCallInfo({
            partnerId: recipientId,
            partnerName: recipientName,
            partnerAvatar: recipientAvatar,
            isVideo,
            roomId
        });
        setCallState('calling');

        // Emit call start
        const userId = (user as any)?._id || user?.id;
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

        // Emit acceptance to the ORIGINAL CALLER
        socket.emit('call_response', {
            callerId: callInfo.partnerId,
            accepted: true,
            roomId: callInfo.roomId
        });

        openMeeting(callInfo.roomId);
        setCallState('idle');
    };

    const rejectCall = () => {
        if (!socket || !callInfo) return;
        socket.emit('call_response', {
            callerId: 'unknown',
            accepted: false
        });
        setCallState('idle');
        setCallInfo(null);
    };

    const openMeeting = (roomId: string) => {
        const url = `https://meet.jit.si/${roomId}`;
        window.open(url, '_blank');
    };

    return (
        <CallContext.Provider value={{ startCall, endCall: rejectCall }}>
            {children}

            {/* INCOMING CALL MODAL */}
            {callState === 'incoming' && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={bgBlurStyle(getImageUrl(callInfo?.partnerAvatar))}></div>
                        <div style={contentStyle}>
                            <img
                                src={getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150'}
                                style={avatarStyle}
                                alt="Caller"
                            />
                            <h2 style={nameStyle}>{callInfo?.partnerName}</h2>
                            <p style={statusStyle}>Incoming {callInfo?.isVideo ? 'Video' : 'Audio'} Call...</p>

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
                            <div style={pulsingAvatarContainer}>
                                <img
                                    src={getImageUrl(callInfo?.partnerAvatar) || 'https://via.placeholder.com/150'}
                                    style={avatarStyle}
                                    alt="Recipient"
                                />
                            </div>
                            <h2 style={nameStyle}>{callInfo?.partnerName}</h2>
                            <p style={statusStyle}>Calling...</p>

                            <button style={{ ...btnStyle, ...declineBtnStyle, marginTop: '40px' }} onClick={rejectCall}>
                                <X size={32} color="#fff" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CallContext.Provider>
    );
};

// Styles
const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    backdropFilter: 'blur(5px)'
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
    filter: 'blur(30px) brightness(0.6)', zIndex: 0
});

const contentStyle: React.CSSProperties = {
    position: 'relative', zIndex: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    color: '#fff', textAlign: 'center'
};

const avatarStyle: React.CSSProperties = {
    width: '120px', height: '120px', borderRadius: '50%',
    objectFit: 'cover', border: '4px solid #fff', marginBottom: '20px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
};

const pulsingAvatarContainer: React.CSSProperties = {
    position: 'relative',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    marginBottom: '20px'
};

const nameStyle: React.CSSProperties = {
    fontSize: '32px', fontWeight: 800, marginBottom: '8px',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
};

const statusStyle: React.CSSProperties = {
    fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '40px'
};

const actionRowStyle: React.CSSProperties = {
    display: 'flex', gap: '60px'
};

const btnStyle: React.CSSProperties = {
    width: '72px', height: '72px', borderRadius: '50%',
    border: 'none', cursor: 'pointer',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
};

const acceptBtnStyle: React.CSSProperties = { backgroundColor: '#4ade80' };
const declineBtnStyle: React.CSSProperties = { backgroundColor: '#ef4444' };
