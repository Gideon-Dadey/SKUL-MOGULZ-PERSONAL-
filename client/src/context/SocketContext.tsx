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
            // Initialize socket connection
            const newSocket = io('http://localhost:5000'); // Replace with your backend URL

            newSocket.on('connect', () => {
                setIsConnected(true);
                console.log('Socket connected:', newSocket.id);
                // Join personal room for notifications/messages
                newSocket.emit('join_room', user.id);
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
