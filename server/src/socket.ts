import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer;

export const initSocket = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: '*', // In production, restrict to your frontend URL
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Allow users to join a room specific to their userId
        socket.on('join_room', (userId: string) => {
            const roomName = String(userId);
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined room: ${roomName}`);
        });

        // Call Signaling
        socket.on('call_start', (data: { recipientId: string, senderId: string, callerName: string, callerAvatar: string, isVideo: boolean, roomId: string }) => {
            // Emit to the recipient's room
            io.to(String(data.recipientId)).emit('incoming_call', data);
        });

        socket.on('call_response', (data: { callerId: string, accepted: boolean, roomId?: string, reason?: string }) => {
            // callerId is the ID of the person who STAYED on the line (the original caller)
            io.to(String(data.callerId)).emit('call_status', data);
        });

        // WebRTC Signaling - Offer
        socket.on('webrtc_offer', (data: { offer: RTCSessionDescriptionInit, recipientId: string }) => {
            io.to(String(data.recipientId)).emit('webrtc_offer', {
                offer: data.offer,
                senderId: socket.id
            });
        });

        // WebRTC Signaling - Answer
        socket.on('webrtc_answer', (data: { answer: RTCSessionDescriptionInit, recipientId: string }) => {
            io.to(String(data.recipientId)).emit('webrtc_answer', {
                answer: data.answer,
                senderId: socket.id
            });
        });

        // WebRTC Signaling - ICE Candidates
        socket.on('ice_candidate', (data: { candidate: RTCIceCandidateInit, recipientId: string }) => {
            io.to(String(data.recipientId)).emit('ice_candidate', {
                candidate: data.candidate,
                senderId: socket.id
            });
        });

        // Call ended notification
        socket.on('call_ended', (data: { recipientId: string }) => {
            io.to(String(data.recipientId)).emit('call_ended');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
