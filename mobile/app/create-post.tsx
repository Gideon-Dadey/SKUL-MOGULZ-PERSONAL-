import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Image as ImageIcon, MapPin, Send } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api from '../services/api';

export default function CreatePostScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const activeColors = Colors[theme];

    const [content, setContent] = useState('');
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [location, setLocation] = useState<string | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your photos to upload media.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 4,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImages([...images, ...result.assets]);
        }
    };

    const handleLocationPress = async () => {
        try {
            setIsFetchingLocation(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to tag your buzz.');
                setIsFetchingLocation(false);
                return;
            }

            const currentPos = await Location.getCurrentPositionAsync({});
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: currentPos.coords.latitude,
                longitude: currentPos.coords.longitude,
            });

            if (reverseGeocode.length > 0) {
                const item = reverseGeocode[0];
                const locString = `${item.city || item.region || 'Unknown Location'}${item.district ? `, ${item.district}` : ''}`;
                setLocation(locString);
            }
        } catch (error) {
            console.error('Location Error:', error);
            // Alert.alert('Error', 'Could not fetch your location.');
        } finally {
            setIsFetchingLocation(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            Alert.alert('Empty Post', "What's on your mind?");
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('content', content);
            if (location) formData.append('location', location);

            images.forEach((mediaItem, index) => {
                const filename = mediaItem.uri.split('/').pop() || `media_${index}.jpg`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formData.append('media', {
                    uri: Platform.OS === 'ios' ? mediaItem.uri.replace('file://', '') : mediaItem.uri,
                    name: filename,
                    type,
                } as any);
            });

            await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            router.back();
        } catch (error: any) {
            console.error('Create Post Error:', error);
            Alert.alert('Error', 'Failed to share update');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { borderBottomColor: activeColors.border, paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <X size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>Share Update</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                    style={[styles.postBtn, { backgroundColor: activeColors.tint, opacity: (isSubmitting || !content.trim()) ? 0.6 : 1 }]}
                >
                    {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postBtnText}>Post</Text>}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <TextInput
                        placeholder="Share your breakthrough or daily buzz..."
                        placeholderTextColor={activeColors.muted}
                        style={[styles.contentInput, { color: activeColors.text }]}
                        multiline
                        autoFocus
                        value={content}
                        onChangeText={setContent}
                    />

                    {location && (
                        <View style={[styles.locationBadge, { backgroundColor: activeColors.tint + '15' }]}>
                            <MapPin size={14} color={activeColors.tint} />
                            <Text style={[styles.locationText, { color: activeColors.tint }]}>{location}</Text>
                            <TouchableOpacity onPress={() => setLocation(null)}>
                                <X size={14} color={activeColors.tint} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {images.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaPreviewScroll}>
                            {images.map((img, index) => (
                                <View key={index} style={styles.imagePreview}>
                                    <Image source={{ uri: img.uri }} style={styles.previewImg} />
                                    <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(index)}>
                                        <X size={12} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </ScrollView>

                <View style={[styles.toolbar, { borderTopColor: activeColors.border, backgroundColor: activeColors.card }]}>
                    <TouchableOpacity onPress={pickImage} style={styles.toolbarBtn}>
                        <ImageIcon size={24} color={activeColors.tint} />
                        <Text style={[styles.toolbarText, { color: activeColors.muted }]}>Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLocationPress} style={styles.toolbarBtn} disabled={isFetchingLocation}>
                        {isFetchingLocation ? (
                            <ActivityIndicator size="small" color={activeColors.tint} />
                        ) : (
                            <>
                                <MapPin size={24} color={location ? activeColors.tint : activeColors.muted} />
                                <Text style={[styles.toolbarText, { color: location ? activeColors.tint : activeColors.muted }]}>
                                    {location ? 'Tagged' : 'Location'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 8 },
    postBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    postBtnText: { color: '#fff', fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    contentInput: { fontSize: 18, minHeight: 150, lineHeight: 28 },
    mediaPreviewScroll: { marginTop: 20 },
    imagePreview: { width: 120, height: 120, marginRight: 12, borderRadius: 12, overflow: 'hidden' },
    previewImg: { width: '100%', height: '100%' },
    removeImgBtn: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4 },
    toolbar: { flexDirection: 'row', padding: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 15, gap: 24 },
    toolbarBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    toolbarText: { fontSize: 14, fontWeight: '600' },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    locationText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
