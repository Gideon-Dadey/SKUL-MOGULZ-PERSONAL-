
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Linking, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';

export default function PushNotificationsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    const openSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.openSettings();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Push Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: activeColors.text }]}>Turn on notifications</Text>
                <Text style={[styles.subtitle, { color: activeColors.muted }]}>
                    You'll need to turn on notifications in your {Platform.OS === 'ios' ? 'iOS' : 'Android'} Settings. Here's how:
                </Text>

                <View style={[styles.separator, { backgroundColor: activeColors.border }]} />

                <View style={styles.instructionRow}>
                    <View style={styles.iconContainer}>
                        <View style={[styles.redBox, { borderRadius: 8 }]}>
                            <Bell size={18} color="#fff" fill="#fff" />
                        </View>
                    </View>
                    <Text style={[styles.instructionText, { color: activeColors.text }]}>Go to "Notifications"</Text>
                </View>

                <View style={styles.instructionRow}>
                    <View style={styles.iconContainer}>
                        <View style={styles.toggleIcon}>
                            <View style={styles.toggleTrack} />
                            <View style={styles.toggleThumb} />
                        </View>
                    </View>
                    <Text style={[styles.instructionText, { color: activeColors.text }]}>Turn on "Allow Notifications"</Text>
                </View>

                <TouchableOpacity
                    style={[styles.settingsBtn, { backgroundColor: activeColors.tint }]}
                    onPress={openSettings}
                >
                    <Text style={styles.settingsBtnText}>Open in Settings</Text>
                </TouchableOpacity>
            </View>
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
    content: { paddingHorizontal: 40, paddingTop: 40, alignItems: 'center' },
    title: { fontSize: 30, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 24, marginBottom: 30, paddingHorizontal: 10 },
    separator: { width: '100%', height: 1, marginBottom: 40 },
    instructionRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 32, paddingLeft: 10 },
    iconContainer: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
    redBox: { width: 32, height: 32, backgroundColor: '#FF4B4B', justifyContent: 'center', alignItems: 'center' },
    toggleIcon: { width: 36, height: 22, backgroundColor: '#4CD964', borderRadius: 11, justifyContent: 'center', paddingHorizontal: 2 },
    toggleTrack: {},
    toggleThumb: { width: 18, height: 18, backgroundColor: '#fff', borderRadius: 9, alignSelf: 'flex-end' },
    instructionText: { fontSize: 17, fontWeight: '500' },
    settingsBtn: {
        marginTop: 40,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    settingsBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
