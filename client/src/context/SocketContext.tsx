import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
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
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            const userId = (user as any)?._id || user?.id;
            if (!userId) return;

            const newSocket = io(BASE_URL);

            newSocket.on('connect', () => {
                setIsConnected(true);
                const finalUserId = String(userId);
                console.log('Socket connected:', newSocket.id);
                newSocket.emit('join_room', finalUserId);
                console.log('Web joined room:', finalUserId);
            });

            newSocket.on('disconnect', (reason) => {
                setIsConnected(false);
                console.log('Socket disconnected:', reason);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            setSocket(newSocket);

            return () => {
                console.log('Cleaning up socket connection...');
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [isAuthenticated, (user as any)?._id || user?.id]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
