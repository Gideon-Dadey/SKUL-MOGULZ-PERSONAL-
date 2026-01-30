
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Platform, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
    Settings, Bookmark, Gamepad2, Users, ChevronRight, Briefcase, X, Crown, BarChart2
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import { getImageUrl } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileMenuScreen() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const activeColors = Colors[theme];
    const isDark = theme === 'dark';

    const goToProfileDetails = () => {
        router.push('/profile/details');
    };

    // Helper to format name to Title Case
    const formatName = (str?: string) => {
        if (!str) return '';
        return str.split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    };

    const fullName = formatName((user?.firstName || '') + ' ' + (user?.lastName || ''));

    // Custom "Organic" Background colors
    const topSectionColor = isDark ? '#1a1a1a' : '#ffffff';
    const bottomSectionColor = isDark ? '#121212' : '#f8f9fa'; // Slightly off-white for menu
    const separatorColor = isDark ? '#333' : '#e5e7eb';

    return (
        <View style={[styles.container, { backgroundColor: topSectionColor }]}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header / Info Section */}
            <View style={[styles.topSection, { paddingTop: insets.top + 10, backgroundColor: topSectionColor }]}>
                {/* Close Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.closeBtn}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <X size={26} color={activeColors.text} />
                </TouchableOpacity>

                {/* User Info Block */}
                <TouchableOpacity activeOpacity={0.8} onPress={goToProfileDetails} style={styles.profileBlock}>
                    <View style={styles.avatarRow}>
                        <Image
                            source={{ uri: getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=A5D6B7&color=fff` }}
                            style={styles.avatar}
                        />
                    </View>

                    <Text style={[styles.name, { color: activeColors.text }]}>
                        {fullName || 'User'}
                    </Text>

                    <Text style={[styles.headline, { color: activeColors.muted }]}>
                        {user?.headline || (user?.role === 'student' ? 'Student Entrepreneur' : 'Investor')}
                    </Text>

                    {/* Company Badge - "Organic" Pill Style */}
                    <View style={[styles.companyBadge, { backgroundColor: isDark ? '#2c3e50' : '#f0f9ff' }]}>
                        <Briefcase size={14} color={isDark ? '#a0aec0' : '#0077b5'} strokeWidth={2.5} />
                        <Text style={[styles.companyText, { color: isDark ? '#e2e8f0' : '#0077b5' }]}>
                            {user?.experience?.[0]?.company || 'PragmaHealth LLC'}
                        </Text>
                    </View>

                    {/* Analytics Preview */}
                    <View style={styles.analyticsRow}>
                        <View style={styles.viewCountContainer}>
                            <Text style={styles.viewCount}>{user?.viewedProfile || 281}</Text>
                            <Text style={[styles.viewLabel, { color: activeColors.muted }]}> profile viewers</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/profile/details')}>
                            <Text style={styles.analyticsLink}>View all analytics</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Menu Section - Different Background for "Standard" Separation */}
            <View style={[styles.menuSection, { backgroundColor: bottomSectionColor, borderTopColor: separatorColor }]}>
                <ScrollView contentContainerStyle={styles.menuScroll} showsVerticalScrollIndicator={false}>

                    {/* Menu Items */}
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.iconContainer}>
                            <Gamepad2 size={22} color={activeColors.text} strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.menuText, { color: activeColors.text }]}>Puzzle games</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.iconContainer}>
                            <Bookmark size={22} color={activeColors.text} strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.menuText, { color: activeColors.text }]}>Saved posts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.iconContainer}>
                            <Users size={22} color={activeColors.text} strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.menuText, { color: activeColors.text }]}>Groups</Text>
                    </TouchableOpacity>

                </ScrollView>

                {/* Footer Actions */}
                <View style={[styles.footer, { borderColor: separatorColor, backgroundColor: bottomSectionColor }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
                        <View style={styles.iconContainer}>
                            <Settings size={22} color={activeColors.text} strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.menuText, { color: activeColors.text }]}>Settings</Text>
                    </TouchableOpacity>

                    {/* Premium Button - Gold Organic Pill */}
                    <TouchableOpacity style={styles.premiumButton}>
                        <Crown size={18} color="#78350f" fill="#f59e0b" fillOpacity={0.2} />
                        <Text style={styles.premiumText}>Reactivate Premium: 50% Off</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topSection: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginLeft: -12,
        marginBottom: 16,
    },
    profileBlock: {
        gap: 8,
    },
    avatarRow: {
        marginBottom: 8,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    name: {
        fontSize: 24, // Standard, big but not huge
        fontWeight: '800', // Professional heavy weight
        letterSpacing: -0.5,
    },
    headline: {
        fontSize: 15,
        fontWeight: '400',
    },
    companyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 8,
        marginTop: 4,
        marginBottom: 8,
    },
    companyText: {
        fontSize: 14,
        fontWeight: '600',
    },
    analyticsRow: {
        marginTop: 12,
        gap: 6,
    },
    viewCountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    viewCount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0a66c2', // Professional blue
    },
    viewLabel: {
        fontSize: 14,
    },
    analyticsLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        textDecorationLine: 'underline',
        opacity: 0.8,
    },
    menuSection: {
        flex: 1,
        borderTopWidth: 1,
        borderTopRightRadius: 24, // Organic touch
        borderTopLeftRadius: 24, // Organic touch
        marginTop: -20, // Overlap slightly for layered focus? Or just visually separate.
        // Let's not do negative margin, just standard separation
        marginTop: 0,
        paddingTop: 32,
    },
    menuScroll: {
        paddingHorizontal: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        gap: 16,
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
    },
    menuText: {
        fontSize: 17,
        fontWeight: '500', // Standard readable weight
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
    },
    premiumButton: {
        backgroundColor: '#fde68a', // Soft gold
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16, // Organic rounded
        gap: 10,
        marginTop: 12,
        shadowColor: "#d97706",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    premiumText: {
        color: '#78350f', // Dark amber text
        fontSize: 15,
        fontWeight: '700',
    },
});
