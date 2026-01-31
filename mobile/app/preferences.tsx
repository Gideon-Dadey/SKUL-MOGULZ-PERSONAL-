
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';
import api from '../services/api';

export default function PreferencesScreen() {
    const router = useRouter();
    const { theme, themePreference } = useTheme();
    const { user, logout } = useAuth();
    const activeColors = Colors[theme];

    // Toggle States
    const [loadMedia, setLoadMedia] = useState(true);
    const [autoplayVideos, setAutoplayVideos] = useState(true);
    const [autoplayGifs, setAutoplayGifs] = useState(true);
    const [showReposts, setShowReposts] = useState(true);
    const [showReplies, setShowReplies] = useState(true);
    const [allowDMs, setAllowDMs] = useState(true);
    const [uploadLargeMedia, setUploadLargeMedia] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    const renderToggle = (label: string, value: boolean, onValueChange: (val: boolean) => void, indent = false) => (
        <View style={[styles.row, { backgroundColor: activeColors.card }]}>
            <View style={[styles.rowLabelContainer, indent && styles.indent]}>
                {indent && <View style={[styles.bullet, { backgroundColor: activeColors.tint }]} />}
                <Text style={[styles.rowLabel, { color: activeColors.text }]}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: activeColors.tint }}
                thumbColor={Platform.OS === 'ios' ? '#fff' : value ? '#fff' : '#f4f3f4'}
            />
        </View>
    );

    const renderNavRow = (label: string, value?: string, onPress?: () => void, isDestructive = false) => (
        <TouchableOpacity
            style={[styles.row, { backgroundColor: activeColors.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.rowLabel, { color: isDestructive ? '#ef4444' : activeColors.text }]}>{label}</Text>
            <View style={styles.rowRight}>
                {value && <Text style={[styles.rowValue, { color: activeColors.muted }]}>{value}</Text>}
                <ChevronRight size={20} color={activeColors.muted} />
            </View>
        </TouchableOpacity>
    );

    const renderSectionHeader = (title: string) => (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: activeColors.text }]}>{title}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Preferences</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Push Notifications */}
                <View style={styles.section}>
                    {renderNavRow('Push notifications', 'Off', () => router.push('/push-notifications'))}
                </View>

                {/* Home */}
                {renderSectionHeader('Home')}
                <View style={styles.section}>
                    {renderToggle('Load media', loadMedia, setLoadMedia)}
                    {renderToggle('Autoplay videos', autoplayVideos, setAutoplayVideos, true)}
                    {renderToggle('Autoplay animated gifs', autoplayGifs, setAutoplayGifs, true)}
                    {renderToggle('Show Reposts', showReposts, setShowReposts)}
                    {renderToggle('Show replies', showReplies, setShowReplies)}
                </View>

                {/* Direct Messages */}
                {renderSectionHeader('Direct Messages')}
                <View style={styles.section}>
                    <View style={[styles.row, { backgroundColor: activeColors.card }]}>
                        <Text style={[styles.rowLabel, { color: activeColors.text, flex: 1, paddingRight: 16 }]}>
                            Allow users you follow to start a new chat with you
                        </Text>
                        <Switch
                            value={allowDMs}
                            onValueChange={setAllowDMs}
                            trackColor={{ false: '#767577', true: activeColors.tint }}
                            thumbColor={'#fff'}
                        />
                    </View>
                </View>

                {/* Compose */}
                {renderSectionHeader('Compose')}
                <View style={styles.section}>
                    <View style={[styles.row, { backgroundColor: activeColors.card }]}>
                        <Text style={[styles.rowLabel, { color: activeColors.text, flex: 1, paddingRight: 16 }]}>
                            Upload media larger than 10 MB while using cellular data
                        </Text>
                        <Switch
                            value={uploadLargeMedia}
                            onValueChange={setUploadLargeMedia}
                            trackColor={{ false: '#767577', true: activeColors.tint }}
                            thumbColor={'#fff'}
                        />
                    </View>
                </View>

                {/* Privacy */}
                {renderSectionHeader('Privacy')}
                <View style={styles.section}>
                    {renderNavRow('Mutes', '', () => { })}
                    {renderNavRow('Blocks', '', () => { })}
                    {renderNavRow('Discoverability', '', () => { })}
                </View>

                {/* Security */}
                {renderSectionHeader('Security')}
                <View style={styles.section}>
                    {renderNavRow('Change email', user?.email || 'email@example.com', () => { })}
                    {renderNavRow('Change password', '', () => { })}
                    {renderToggle('Two-factor authentication (2FA)', twoFactor, setTwoFactor)}
                    {renderNavRow('Active Sessions', '', () => { })}
                </View>

                {/* Other */}
                {renderSectionHeader('Other')}
                <View style={styles.section}>
                    {renderNavRow('App appearance', themePreference.charAt(0).toUpperCase() + themePreference.slice(1), () => router.push('/appearance'))}
                    {renderNavRow('Legal', '', () => { })}
                    {renderNavRow('3rd party licenses', '', () => { })}
                    {renderNavRow('Delete account', '', () => router.push('/delete-account'), true)}
                </View>

                <Text style={[styles.version, { color: activeColors.muted }]}>Version: 1.25.0 (474)</Text>
                <View style={{ height: 40 }} />

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 36, paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { paddingBottom: 40 },
    section: { marginTop: 0, marginBottom: 24 },
    sectionHeader: { paddingHorizontal: 16, marginBottom: 8, marginTop: 16 },
    sectionHeaderText: { fontSize: 18, fontWeight: '800' },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 14, paddingHorizontal: 16,
    },
    rowLabelContainer: { flexDirection: 'row', alignItems: 'center' },
    rowLabel: { fontSize: 16, fontWeight: '500' },
    indent: { marginLeft: 16 },
    bullet: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rowValue: { fontSize: 15 },
    version: { textAlign: 'center', marginTop: 20, fontSize: 13 },
});
