import React from 'react';
import { Tabs, router } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, Briefcase, MessageCircle, Bell, SquarePlus } from 'lucide-react-native';

import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const activeColors = Colors[theme];
  const insets = useSafeAreaInsets();

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
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/modal');
          },
        })}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
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
