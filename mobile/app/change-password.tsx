
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api from '../services/api';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/password', { currentPassword, newPassword });
            Alert.alert('Success', 'Password updated successfully');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Change Password</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.label, { color: activeColors.text }]}>Current Password</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: activeColors.card, color: activeColors.text, borderColor: activeColors.border }]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={activeColors.muted}
                    secureTextEntry
                />

                <Text style={[styles.label, { color: activeColors.text }]}>New Password</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: activeColors.card, color: activeColors.text, borderColor: activeColors.border }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={activeColors.muted}
                    secureTextEntry
                />

                <Text style={[styles.label, { color: activeColors.text }]}>Confirm New Password</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: activeColors.card, color: activeColors.text, borderColor: activeColors.border }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={activeColors.muted}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: activeColors.tint, opacity: loading ? 0.7 : 1 }]}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
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
    content: { padding: 24 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 24,
    },
    saveBtn: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
