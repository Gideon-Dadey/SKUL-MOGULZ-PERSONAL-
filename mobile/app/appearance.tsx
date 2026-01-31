
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Smartphone, Sun, MoonStar, Check } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';

export default function AppearanceScreen() {
    const router = useRouter();
    const { theme, themePreference, setThemePreference } = useTheme();
    const activeColors = Colors[theme];

    const options = [
        { id: 'system', label: 'System', icon: Smartphone },
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: MoonStar },
    ];

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>App Appearance</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {options.map((option) => {
                    const Icon = option.icon;
                    const isSelected = themePreference === option.id;

                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.row, { borderBottomColor: activeColors.border }]}
                            onPress={() => setThemePreference(option.id as any)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.rowLeft}>
                                <Icon size={24} color={isSelected ? activeColors.tint : activeColors.muted} />
                                <Text style={[styles.rowLabel, { color: activeColors.text }]}>{option.label}</Text>
                            </View>
                            {isSelected && <Check size={24} color={activeColors.text} />}
                        </TouchableOpacity>
                    );
                })}
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
    content: { paddingVertical: 10 },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 18, paddingHorizontal: 24,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    rowLabel: { fontSize: 18, fontWeight: '600' },
});
