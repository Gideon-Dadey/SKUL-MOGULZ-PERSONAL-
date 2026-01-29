
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, User as UserIcon, Briefcase, MapPin, AlignLeft, Info } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import authService from '../services/authService';

export default function EditProfileScreen() {
    const { user, updateProfile } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const activeColors = Colors[theme];

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        headline: user?.headline || '',
        bio: user?.bio || '',
        location: user?.location || '',
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!formData.firstName || !formData.lastName) {
            Alert.alert('Error', 'First and Last name are required');
            return;
        }

        try {
            setIsSaving(true);
            await updateProfile(formData);
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Update Profile Error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const renderInput = (label: string, value: string, onChangeText: (text: string) => void, placeholder: string, icon: any, multiline = false) => (
        <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
                {icon}
                <Text style={[styles.label, { color: activeColors.text }]}>{label}</Text>
            </View>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: activeColors.card,
                        borderColor: activeColors.border,
                        color: activeColors.text,
                        height: multiline ? 100 : 48,
                        textAlignVertical: multiline ? 'top' : 'center'
                    }
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={activeColors.light}
                multiline={multiline}
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: activeColors.background }]}
        >
            <View style={[styles.header, { backgroundColor: activeColors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Edit profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.iconBtn}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color={activeColors.tint} />
                    ) : (
                        <Text style={[styles.saveText, { color: activeColors.tint }]}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.infoBox, { backgroundColor: activeColors.tint + '10', borderColor: activeColors.tint + '30' }]}>
                    <Info size={16} color={activeColors.tint} />
                    <Text style={[styles.infoText, { color: activeColors.text }]}>
                        LinkedIn profiles with headlines get 14x more views. Tell investors what you're building!
                    </Text>
                </View>

                {renderInput(
                    'First Name',
                    formData.firstName,
                    (text) => setFormData({ ...formData, firstName: text }),
                    'Enter first name',
                    <UserIcon size={18} color={activeColors.muted} />
                )}

                {renderInput(
                    'Last Name',
                    formData.lastName,
                    (text) => setFormData({ ...formData, lastName: text }),
                    'Enter last name',
                    <UserIcon size={18} color={activeColors.muted} />
                )}

                {renderInput(
                    'Headline',
                    formData.headline,
                    (text) => setFormData({ ...formData, headline: text }),
                    'Ex: Student Founder | Building Fintech for GenZ',
                    <Briefcase size={18} color={activeColors.muted} />
                )}

                {renderInput(
                    'Location',
                    formData.location,
                    (text) => setFormData({ ...formData, location: text }),
                    'Ex: San Francisco, CA',
                    <MapPin size={18} color={activeColors.muted} />
                )}

                {renderInput(
                    'About',
                    formData.bio,
                    (text) => setFormData({ ...formData, bio: text }),
                    'Share your story, your project, and what you’re looking for...',
                    <AlignLeft size={18} color={activeColors.muted} />,
                    true
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 36,
        paddingBottom: 12,
        height: Platform.OS === 'ios' ? 100 : 86,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    iconBtn: {
        padding: 4,
        minWidth: 44,
        alignItems: 'center',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 16,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
        marginBottom: 24,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        fontSize: 16,
    },
});
