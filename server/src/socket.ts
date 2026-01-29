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
            socket.join(userId);
            console.log(`User ${userId} joined their personal room`);
        });

        // Call Signaling
        socket.on('call_start', (data: { recipientId: string, senderId: string, callerName: string, callerAvatar: string, isVideo: boolean, roomId: string }) => {
            // Emit to the recipient's room
            io.to(data.recipientId).emit('incoming_call', data);
        });

        socket.on('call_response', (data: { callerId: string, accepted: boolean, roomId?: string }) => {
            // callerId is the ID of the person who STAYED on the line (the original caller)
            // But we emit to their room
            io.to(data.callerId).emit('call_status', data);
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
