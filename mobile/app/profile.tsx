
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Settings, Bookmark, Gamepad2, Users, ChevronRight, BarChart2, Briefcase, MapPin, X, Crown
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import { getImageUrl } from '../services/api';

export default function ProfileMenuScreen() {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const activeColors = Colors[theme];

    // Navigate to full profile details
    const goToProfileDetails = () => {
        router.push('/profile/details');
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <View style={[styles.header, { backgroundColor: activeColors.card }]}>
                {/* Top Bar with Close button maybe? Or just back */}
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <X size={24} color={activeColors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.userInfo} onPress={goToProfileDetails}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=A5D6B7&color=fff` }}
                            style={styles.avatar}
                        />
                    </View>

                    <Text style={[styles.name, { color: activeColors.text }]}>
                        {user?.firstName} {user?.lastName}
                    </Text>

                    <Text style={[styles.headline, { color: activeColors.muted }]} numberOfLines={2}>
                        {user?.headline || (user?.role === 'student' ? 'Student Entrepreneur' : 'Investor')}
                    </Text>

                    {user?.location && (
                        <Text style={[styles.location, { color: activeColors.muted }]}>
                            {user.location}
                        </Text>
                    )}

                    <View style={styles.companyRow}>
                        <View style={{ width: 24, height: 24, backgroundColor: '#e0f2f1', borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                            <Briefcase size={14} color="#00695c" />
                        </View>
                        <Text style={[styles.companyText, { color: activeColors.text }]}>
                            {user?.experience?.[0]?.company || 'PragmaHealth LLC'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.statsRow}>
                    <Text style={[styles.statsCount, { color: '#3b82f6' }]}>{user?.viewedProfile || 281}</Text>
                    <Text style={[styles.statsLabel, { color: activeColors.muted }]}> profile viewers</Text>
                </View>

                <TouchableOpacity activeOpacity={0.7} style={styles.analyticsLink}>
                    <Text style={[styles.analyticsLinkText, { color: activeColors.text }]}>View all analytics</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconInfo}>
                        <Gamepad2 size={24} color={activeColors.text} />
                        <Text style={[styles.menuText, { color: activeColors.text }]}>Puzzle games</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconInfo}>
                        <Bookmark size={24} color={activeColors.text} />
                        <Text style={[styles.menuText, { color: activeColors.text }]}>Saved posts</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconInfo}>
                        <Users size={24} color={activeColors.text} />
                        <Text style={[styles.menuText, { color: activeColors.text }]}>Groups</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: activeColors.border }]}>
                <TouchableOpacity style={styles.footerItem}>
                    <Settings size={24} color={activeColors.text} />
                    <Text style={[styles.footerText, { color: activeColors.text }]}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.premiumBtn}>
                    <Crown size={20} color="#5a3a00" />
                    <Text style={styles.premiumBtnText}>Reactivate Premium: 50% Off</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    closeBtn: {
        alignSelf: 'flex-start',
        padding: 4,
        marginBottom: 16,
        marginLeft: -4
    },
    userInfo: {
        marginBottom: 16,
    },
    avatarContainer: {
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headline: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    location: {
        fontSize: 14,
        marginBottom: 12,
    },
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    companyText: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statsCount: {
        fontSize: 14,
        fontWeight: '700',
    },
    statsLabel: {
        fontSize: 14,
    },
    analyticsLink: {
        paddingVertical: 8,
    },
    analyticsLinkText: {
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    menuContainer: {
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    menuIconInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuText: {
        fontSize: 18,
        fontWeight: '600',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    footerText: {
        fontSize: 16,
        fontWeight: '600',
    },
    premiumBtn: {
        backgroundColor: '#ffd580', // Gold/Warning color
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
    },
    premiumBtnText: {
        color: '#5a3a00',
        fontWeight: '700',
        fontSize: 15,
    }
});
