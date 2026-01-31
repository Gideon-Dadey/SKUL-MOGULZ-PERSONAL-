import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

interface NotificationContextType {
    unreadCount: number;
    setUnreadCount: (count: number) => void;
    refreshUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const { isAuthenticated } = useAuth();
    const { socket } = useSocket();

    const refreshUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const notifications = await notificationService.getNotifications();
            const unread = notifications.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to refresh unread count:', error);
        }
    }, [isAuthenticated]);

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error;
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            refreshUnreadCount();
        } else {
            setUnreadCount(0);
        }
    }, [isAuthenticated, refreshUnreadCount]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = () => {
            setUnreadCount(prev => prev + 1);
        };

        socket.on('notification', handleNewNotification);
        return () => {
            socket.off('notification', handleNewNotification);
        };
    }, [socket]);

    return (
        <NotificationContext.Provider
            value={{
                unreadCount,
                setUnreadCount,
                refreshUnreadCount,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
