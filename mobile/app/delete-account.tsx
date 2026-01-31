
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';
import api from '../services/api';

export default function DeleteAccountScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { logout } = useAuth();
    const activeColors = Colors[theme];

    const handleDelete = () => {
        Alert.alert(
            'Confirm Deletion',
            'Are you absolutely sure? This action is permanent.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete('/auth/delete');
                            await logout();
                            router.replace('/(auth)/login');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Delete Account</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: activeColors.text }]}>Delete your account?</Text>
                <Text style={[styles.subtitle, { color: activeColors.muted }]}>
                    You will be asked for confirmation before your account is permanently deleted.
                </Text>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteBtnText}>Yes, delete my account</Text>
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
    content: { paddingHorizontal: 24, paddingTop: 40 },
    title: { fontSize: 34, fontWeight: '900', textAlign: 'left', marginBottom: 20 },
    subtitle: { fontSize: 18, textAlign: 'left', lineHeight: 28, marginBottom: 48, fontWeight: '400' },
    deleteBtn: { width: '100%', alignItems: 'center' },
    deleteBtnText: { color: '#D32F2F', fontSize: 18, fontWeight: '600' },
});
