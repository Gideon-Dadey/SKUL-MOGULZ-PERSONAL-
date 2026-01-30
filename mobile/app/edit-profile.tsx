
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, User as UserIcon, Briefcase, MapPin, AlignLeft, Info, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import { getImageUrl } from '../services/api';

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

    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [bannerUri, setBannerUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your photos to change your avatar.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const pickBanner = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your photos to change your banner.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setBannerUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!formData.firstName || !formData.lastName) {
            Alert.alert('Error', 'First and Last name are required');
            return;
        }

        try {
            setIsSaving(true);

            // Use FormData for multipart upload (avatar + text)
            const data = new FormData();
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('headline', formData.headline);
            data.append('bio', formData.bio);
            data.append('location', formData.location);

            if (avatarUri) {
                const filename = avatarUri.split('/').pop() || 'avatar.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                data.append('avatar', {
                    uri: Platform.OS === 'ios' ? avatarUri.replace('file://', '') : avatarUri,
                    name: filename,
                    type,
                } as any);
            }

            if (bannerUri) {
                const filename = bannerUri.split('/').pop() || 'banner.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                data.append('banner', {
                    uri: Platform.OS === 'ios' ? bannerUri.replace('file://', '') : bannerUri,
                    name: filename,
                    type,
                } as any);
            }

            await updateProfile(data);
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
                {/* Banner Edit */}
                <View style={styles.bannerSection}>
                    <TouchableOpacity onPress={pickBanner} style={[styles.bannerContainer, { backgroundColor: activeColors.tint + '20' }]}>
                        {(bannerUri || user?.banner) ? (
                            <Image
                                source={{ uri: bannerUri || getImageUrl(user?.banner) || '' }}
                                style={styles.bannerImage}
                            />
                        ) : (
                            <View style={styles.bannerPlaceholder}>
                                <Text style={[styles.bannerPlaceholderText, { color: activeColors.tint }]}>Add Background Photo</Text>
                            </View>
                        )}
                        <View style={[styles.cameraIcon, styles.bannerCamera, { backgroundColor: activeColors.tint }]}>
                            <Camera size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Avatar Edit */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={[styles.avatarContainer, { borderColor: activeColors.background }]}>
                        <Image
                            source={avatarUri ? { uri: avatarUri } : (user?.avatar ? { uri: getImageUrl(user.avatar) } : require('../assets/images/icon.png'))}
                            style={styles.avatarLarge}
                        />
                        <View style={[styles.cameraIcon, { backgroundColor: activeColors.tint }]}>
                            <Camera size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    {avatarUri && (
                        <TouchableOpacity onPress={() => setAvatarUri(null)} style={styles.removeImageBtn}>
                            <X size={14} color="#ef4444" />
                            <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>Remove pending photo</Text>
                        </TouchableOpacity>
                    )}
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
                    'Share your story, your project, and what you are looking for...',
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
        paddingBottom: 40,
    },
    bannerSection: {
        marginBottom: -60, // Overlap effect
        position: 'relative',
        zIndex: 1,
    },
    bannerContainer: {
        width: '100%',
        height: 120,
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerPlaceholderText: {
        fontWeight: '600',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
        zIndex: 2,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        position: 'relative',
        borderWidth: 4,
    },
    avatarLarge: {
        width: '100%', // Changed to % to match parent container width minus border
        height: '100%',
        borderRadius: 56, // Adjusted for border
    },
    bannerCamera: {
        right: 16,
        bottom: 16,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    removeImageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 4,
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
