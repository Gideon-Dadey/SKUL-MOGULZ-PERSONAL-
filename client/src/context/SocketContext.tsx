import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

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

            const newSocket = io('http://localhost:5000');

            newSocket.on('connect', () => {
                setIsConnected(true);
                console.log('Socket connected:', newSocket.id);

                // Join room using _id (MongoDB) or id
                const userId = (user as any)?._id || user?.id;
                if (userId) {
                    newSocket.emit('join_room', userId);
                    console.log('Joined room:', userId);
                }
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
                console.log('Socket disconnected');
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
