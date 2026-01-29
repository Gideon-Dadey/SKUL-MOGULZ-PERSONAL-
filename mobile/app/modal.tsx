import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Switch, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Image as ImageIcon, Sparkles, Hash, DollarSign, Briefcase, ChevronRight, Target } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api from '../services/api';
import { PROJECT_CATEGORIES, ProjectCategory } from '../types';

const STAGES = [
  { value: 'idea', label: 'Idea', description: 'Just started', icon: Sparkles },
  { value: 'prototype', label: 'Prototype', description: 'In progress', icon: Target },
  { value: 'mvp', label: 'MVP', description: 'Ready to test', icon: Briefcase },
  { value: 'growth', label: 'Growth', description: 'Gaining traction', icon: DollarSign },
  { value: 'scaling', label: 'Scaling', description: 'Expanding', icon: Hash },
];

export default function ModalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeColors = Colors[theme];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ProjectCategory | ''>('technology');
  const [stage, setStage] = useState('idea');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [hasFunding, setHasFunding] = useState(false);
  const [fundingGoal, setFundingGoal] = useState('');
  const [currentFunding, setCurrentFunding] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to upload media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4 - images.length,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Fields', 'Please add a title and description.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('projectStage', stage);

      tags.forEach(tag => formData.append('tags[]', tag));

      if (hasFunding) {
        formData.append('fundingGoal', fundingGoal.replace(/[^0-9.]/g, '') || '0');
        formData.append('currentFunding', currentFunding.replace(/[^0-9.]/g, '') || '0');
      }

      images.forEach((image, index) => {
        const filename = image.uri.split('/').pop() || `image_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('media', {
          uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
          name: filename,
          type,
        } as any);
      });

      await api.post('/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      router.back();
    } catch (error: any) {
      console.error('Create Post Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <View style={[styles.header, { backgroundColor: activeColors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color={activeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: activeColors.text }]}>New Project</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || !title.trim()}
          style={[styles.postBtn, { backgroundColor: title.trim() ? activeColors.tint : activeColors.border }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Input Area */}
          <TextInput
            placeholder="Project Title"
            placeholderTextColor={activeColors.light}
            style={[styles.titleInput, { color: activeColors.text }]}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            placeholder="Share your progress, seek feedback, or find collaborators..."
            placeholderTextColor={activeColors.light}
            style={[styles.contentInput, { color: activeColors.text }]}
            multiline
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />

          {/* Media Previews */}
          {images.length > 0 && (
            <ScrollView horizontal style={styles.mediaPreviewScroll}>
              {images.map((img, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: img.uri }} style={styles.previewImg} />
                  <TouchableOpacity
                    style={styles.removeImgBtn}
                    onPress={() => removeImage(index)}
                  >
                    <X size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.divider} />

          {/* Tags */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: activeColors.muted }]}>Tags</Text>
            <View style={styles.tagsContainer}>
              {tags.map(tag => (
                <TouchableOpacity key={tag} style={[styles.tag, { backgroundColor: activeColors.tint + '20' }]} onPress={() => removeTag(tag)}>
                  <Text style={[styles.tagText, { color: activeColors.tint }]}>#{tag}</Text>
                  <X size={12} color={activeColors.tint} />
                </TouchableOpacity>
              ))}
              <TextInput
                placeholder="Add tag..."
                placeholderTextColor={activeColors.light}
                style={[styles.tagInput, { color: activeColors.text, borderColor: activeColors.border }]}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: activeColors.muted }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {PROJECT_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat.value ? activeColors.tint : activeColors.card,
                      borderColor: activeColors.border,
                      borderWidth: 1
                    }
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    { color: category === cat.value ? '#fff' : activeColors.text }
                  ]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Stage Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: activeColors.muted }]}>Project Stage</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageScroll}>
              {STAGES.map(s => {
                const Icon = s.icon;
                const isSelected = stage === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[
                      styles.stageCard,
                      {
                        backgroundColor: isSelected ? activeColors.tint + '15' : activeColors.card,
                        borderColor: isSelected ? activeColors.tint : activeColors.border
                      }
                    ]}
                    onPress={() => setStage(s.value)}
                  >
                    <Icon size={20} color={isSelected ? activeColors.tint : activeColors.muted} />
                    <Text style={[styles.stageLabel, { color: isSelected ? activeColors.tint : activeColors.text }]}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Funding Toggle */}
          <View style={[styles.fundingSection, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            <View style={styles.fundingHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <DollarSign size={20} color={activeColors.text} />
                <Text style={[styles.fundingTitle, { color: activeColors.text }]}>Seeking Funding</Text>
              </View>
              <Switch
                value={hasFunding}
                onValueChange={setHasFunding}
                trackColor={{ false: '#767577', true: activeColors.tint }}
              />
            </View>

            {hasFunding && (
              <View style={styles.fundingInputs}>
                <View style={styles.fundingInputGroup}>
                  <Text style={[styles.inputLabel, { color: activeColors.muted }]}>Goal ($)</Text>
                  <TextInput
                    style={[styles.fundingInput, { color: activeColors.text, borderColor: activeColors.border }]}
                    placeholder="10000"
                    placeholderTextColor={activeColors.light}
                    keyboardType="numeric"
                    value={fundingGoal}
                    onChangeText={setFundingGoal}
                  />
                </View>
                <View style={styles.fundingInputGroup}>
                  <Text style={[styles.inputLabel, { color: activeColors.muted }]}>Raised ($)</Text>
                  <TextInput
                    style={[styles.fundingInput, { color: activeColors.text, borderColor: activeColors.border }]}
                    placeholder="0"
                    placeholderTextColor={activeColors.light}
                    keyboardType="numeric"
                    value={currentFunding}
                    onChangeText={setCurrentFunding}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Keyboard Toolbar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
          style={[
            styles.toolbar,
            {
              backgroundColor: activeColors.card,
              borderTopColor: activeColors.border,
              paddingBottom: (Platform.OS === 'ios' && insets.bottom > 0) ? insets.bottom + 10 : 20
            }
          ]}
        >
          <TouchableOpacity onPress={pickImage} style={styles.toolbarBtn}>
            <ImageIcon size={24} color={activeColors.tint} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn}>
            <Hash size={24} color={activeColors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn}>
            <Sparkles size={24} color={activeColors.text} />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    height: Platform.OS === 'ios' ? 60 : 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  postBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 16,
    minHeight: 120,
    lineHeight: 24,
  },
  mediaPreviewScroll: {
    marginTop: 16,
    marginBottom: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  removeImgBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150,150,150,0.1)',
    marginVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagInput: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 80,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  stageScroll: {
    flexDirection: 'row',
  },
  stageCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    width: 100,
    alignItems: 'center',
    gap: 8,
  },
  stageLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fundingSection: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  fundingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fundingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  fundingInputs: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 16,
  },
  fundingInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  fundingInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    gap: 20,
  },
  toolbarBtn: {
    padding: 8,
  }
});
