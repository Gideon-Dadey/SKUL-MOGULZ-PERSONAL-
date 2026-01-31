
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';
import api from '../services/api';

export default function ChangeEmailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user, refreshUser } = useAuth();
    const activeColors = Colors[theme];

    const [newEmail, setNewEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!newEmail || newEmail === user?.email) return;

        setLoading(true);
        try {
            await api.put('/auth/email', { email: newEmail });
            await refreshUser();
            Alert.alert('Success', 'Email updated successfully');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update email');
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
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Change Email</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.label, { color: activeColors.text }]}>New Email Address</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: activeColors.card, color: activeColors.text, borderColor: activeColors.border }]}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="Enter new email"
                    placeholderTextColor={activeColors.muted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: activeColors.tint, opacity: loading ? 0.7 : 1 }]}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
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
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
