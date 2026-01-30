import React from 'react';
import { Tabs, router } from 'expo-router';
import { Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, Briefcase, MessageCircle, Bell, SquarePlus } from 'lucide-react-native';

import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import api from '../../services/api';

export default function TabLayout() {
  const { theme } = useTheme();
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();
  const activeColors = Colors[theme];
  const insets = useSafeAreaInsets();

  const [unreadAlerts, setUnreadAlerts] = React.useState(0);
  const [unreadMessages, setUnreadMessages] = React.useState(0);

  React.useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (isAuthenticated) {
        try {
          // Fetch notifications
          const alerts = await notificationService.getNotifications();
          setUnreadAlerts(alerts.filter((a: any) => !a.isRead).length);

          // Fetch conversations
          const convRes = await api.get('/messages/conversations');
          const totalUnreadMsg = convRes.data.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
          setUnreadMessages(totalUnreadMsg);
        } catch (error) {
          console.error("Failed to fetch unread counts on mobile", error);
        }
      }
    };

    fetchUnreadCounts();
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (!socket) return;

    const handleNotification = () => setUnreadAlerts(prev => prev + 1);
    const handleNewMessage = () => setUnreadMessages(prev => prev + 1);

    socket.on('notification', handleNotification);
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  // Calculate tab bar height based on platform and safe area
  const tabBarHeight = Platform.OS === 'ios'
    ? 50 + insets.bottom
    : Math.max(68, 58 + insets.bottom);

  const tabBarPaddingBottom = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 20)
    : Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColors.tint,
        tabBarInactiveTintColor: activeColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: activeColors.card,
          borderTopColor: activeColors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: 'Network',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <SquarePlus size={26} color={color} />,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              onPress={() => {
                router.push('/modal');
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
          tabBarBadge: unreadAlerts > 0 ? unreadAlerts : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FF4B2B', color: '#fff' }
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <Briefcase size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null, // Hide the template's 'two' screen
        }}
      />
    </Tabs>
  );
}
