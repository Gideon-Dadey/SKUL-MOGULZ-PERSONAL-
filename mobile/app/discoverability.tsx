
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Platform, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';
import api from '../services/api';

export default function DiscoverabilityScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user, refreshUser } = useAuth();
    const activeColors = Colors[theme];

    const [discoverByEmail, setDiscoverByEmail] = useState(user?.settings?.discoverableByEmail ?? true);
    const [discoverByPhone, setDiscoverByPhone] = useState(user?.settings?.discoverableByPhone ?? true);

    const handleUpdate = async (key: string, value: boolean, setter: (v: boolean) => void) => {
        setter(value);
        try {
            await api.put('/auth/settings', { [key]: value });
            await refreshUser();
        } catch (error) {
            Alert.alert('Error', 'Failed to update discovery settings');
            setter(!value);
        }
    };

    const renderToggle = (label: string, description: string, value: boolean, onValueChange: (val: boolean) => void) => (
        <View style={[styles.row, { borderBottomColor: activeColors.border }]}>
            <View style={styles.rowLeft}>
                <Text style={[styles.rowLabel, { color: activeColors.text }]}>{label}</Text>
                <Text style={[styles.rowDescription, { color: activeColors.muted }]}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: activeColors.tint }}
                thumbColor={'#fff'}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { backgroundColor: activeColors.card, borderBottomColor: activeColors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Discoverability</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Contacts</Text>
                {renderToggle(
                    'Let others find you by your email',
                    'People who have your email address in their contacts will be able to find and connect with you.',
                    discoverByEmail,
                    (v) => handleUpdate('discoverableByEmail', v, setDiscoverByEmail)
                )}
                {renderToggle(
                    'Let others find you by your phone number',
                    'People who have your phone number in their contacts will be able to find and connect with you.',
                    discoverByPhone,
                    (v) => handleUpdate('discoverableByPhone', v, setDiscoverByPhone)
                )}
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
    content: { paddingVertical: 20 },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginLeft: 16, marginBottom: 16 },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 20, paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    rowLeft: { flex: 1, paddingRight: 16 },
    rowLabel: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    rowDescription: { fontSize: 14, lineHeight: 20 },
});
