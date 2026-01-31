import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
    Settings, Bookmark, Gamepad2, Users, User, Crown, UserPlus, FileText, Zap
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api, { getImageUrl } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileMenuScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Use cached connections for stability
    const connectionCount = user?.connections?.length || 0;

    // Theme defaults to light to match screenshot style (Clean White)
    // But we respect dark mode if active, just styling securely.
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    // Screenshot is pure white
    const bgColor = isDark ? '#000000' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#0f1419';
    const subTextColor = isDark ? '#71767b' : '#536471';
    const iconColor = isDark ? '#eff3f4' : '#0f1419';

    const goToProfileDetails = () => {
        router.push('/profile/details');
    };

    const handle = `@${(user?.firstName || 'user').toLowerCase()}${(user?.lastName || '').toLowerCase()}`;

    const MenuOption = ({ icon: Icon, label, onPress, isPremium }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Icon size={26} color={iconColor} strokeWidth={isPremium ? 2.5 : 2} />
            <Text style={[styles.menuText, { color: textColor }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.modalContainer}>
            <Stack.Screen options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'fade'
            }} />

            {/* Transparent Overlay to Close */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={() => router.back()}
            />

            <View style={[styles.sidebar, { backgroundColor: bgColor, paddingTop: insets.top }]}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.topRow}>
                            <TouchableOpacity onPress={goToProfileDetails}>
                                <Image
                                    source={user?.avatar ? { uri: getImageUrl(user.avatar) } : require('../assets/images/icon.png')}
                                    style={styles.avatar}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.addAccountBtn}>
                                <UserPlus size={20} color={iconColor} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.userInfo}>
                            <Text style={[styles.name, { color: textColor }]}>
                                {user?.firstName} {user?.lastName}
                            </Text>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statNum, { color: textColor }]}>{connectionCount}</Text>
                                <Text style={[styles.statLabel, { color: subTextColor }]}> Connections</Text>
                            </View>
                        </View>
                    </View>

                    {/* Main Menu List */}
                    <View style={styles.menuList}>
                        <MenuOption icon={User} label="Profile" onPress={goToProfileDetails} />
                        <MenuOption icon={Zap} label="Innovation Quests" onPress={() => { }} />
                        <MenuOption icon={Bookmark} label="Saved Ventures" onPress={() => { }} />
                        <MenuOption icon={Users} label="Founder Circles" onPress={() => { }} />
                    </View>

                    <View style={[styles.divider, { backgroundColor: isDark ? '#2f3336' : '#eff3f4' }]} />

                    {/* Footer Items */}
                    <View style={styles.footerList}>
                        <TouchableOpacity style={styles.footerItem} onPress={() => router.push('/edit-profile')}>
                            <Text style={[styles.footerText, { color: textColor }]}>Settings and privacy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.footerItem}>
                            <Text style={[styles.footerText, { color: textColor }]}>Reactivate Premium: 50% Off</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Bottom Footer Icons */}
                <View style={[styles.bottomBar, { borderTopColor: isDark ? '#2f3336' : '#eff3f4' }]}>
                    <TouchableOpacity style={styles.bottomIcon}>
                        <Settings size={28} color={iconColor} strokeWidth={1.5} />
                    </TouchableOpacity>
                </View>
            </View>


        </View>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    sidebar: {
        width: '80%', // Occupy 80% screen width
        height: '100%',
        shadowColor: "#000",
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    scrollContent: {
        paddingBottom: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        marginTop: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    addAccountBtn: {
        padding: 4,
        marginTop: 4,
        borderWidth: 1,
        borderColor: 'transparent', // Placeholder for alignment
    },
    userInfo: {
        marginBottom: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: '800', // Heavy bold like X
        marginBottom: 2,
    },
    handle: {
        fontSize: 15,
        fontWeight: '400',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statNum: {
        fontWeight: '700',
        fontSize: 15,
    },
    statLabel: {
        fontSize: 15,
        fontWeight: '400',
    },
    menuList: {
        marginTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 24,
    },
    menuText: {
        fontSize: 20, // Large bold text
        fontWeight: '700',
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 20,
    },
    footerList: {
        paddingHorizontal: 20,
    },
    footerItem: {
        paddingVertical: 12,
    },
    footerText: {
        fontSize: 16,
        fontWeight: '500',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderTopWidth: 1,
    },
    bottomIcon: {
        padding: 8,
    }
});
