import React from 'react';
import { Tabs, router } from 'expo-router';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Folder, Bell, SquarePlus } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();
  const { unreadCount: unreadAlerts } = useNotifications();
  const activeColors = Colors[theme];
  const insets = useSafeAreaInsets();

  const [unreadMessages, setUnreadMessages] = React.useState(0);

  React.useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (isAuthenticated) {
        try {
          // Fetch conversations
          const convRes = await api.get('/messages/conversations');
          const totalUnreadMsg = convRes.data.reduce((acc: number, conv: any) => acc + (conv.unreadCount || 0), 0);
          setUnreadMessages(totalUnreadMsg);
        } catch (error) {
          console.warn("Failed to fetch unread counts on mobile", error);
        }
      }
    };

    fetchUnreadCounts();
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => setUnreadMessages(prev => prev + 1);

    socket.on('new_message', handleNewMessage);

    return () => {
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

  const renderTabIcon = (Icon: any, focused: boolean) => {
    const iconColor = focused ? activeColors.text : activeColors.tabIconDefault;
    return <Icon size={24} color={iconColor} fill={focused ? iconColor : 'transparent'} />;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColors.text,
        tabBarInactiveTintColor: activeColors.tabIconDefault,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: activeColors.card,
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 10,
          elevation: 20,
          shadowColor: theme === 'dark' ? '#000' : '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
          shadowRadius: 15,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? activeColors.text : activeColors.tabIconDefault}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: 'Network',
          tabBarIcon: ({ focused }) => renderTabIcon(Users, focused),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: ({ focused }) => renderTabIcon(SquarePlus, focused),
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
          tabBarIcon: ({ focused }) => renderTabIcon(Bell, focused),
          tabBarBadge: unreadAlerts > 0 ? unreadAlerts : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FF4B2B', color: '#fff' }
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused }) => renderTabIcon(Folder, focused),
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

const styles = StyleSheet.create({
});
