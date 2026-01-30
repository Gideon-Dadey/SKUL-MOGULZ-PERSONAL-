
import React, { useState, useEffect } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, RefreshControl, Platform, Switch,
    Modal, TextInput, KeyboardAvoidingView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    ArrowLeft, Settings, LogOut, MapPin, Users, Edit2, Plus, BarChart2, Eye, PenTool, Moon, Sun,
    X, Briefcase, GraduationCap, Award, Trash2, Check
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Colors from '../constants/Colors';
import api, { getImageUrl } from '../services/api';

interface Experience {
    id?: string;
    _id?: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
}

interface Education {
    id?: string;
    _id?: string;
    school: string;
    degree: string;
    field?: string;
    startYear: string;
    endYear?: string;
    description?: string;
}

export default function ProfileScreen() {
    const { user, logout, updateProfile } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const activeColors = Colors[theme];

    const [myProjects, setMyProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connectionCount, setConnectionCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Modal states
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [experienceModalVisible, setExperienceModalVisible] = useState(false);
    const [educationModalVisible, setEducationModalVisible] = useState(false);
    const [skillsModalVisible, setSkillsModalVisible] = useState(false);

    // Form states
    const [aboutText, setAboutText] = useState(user?.bio || '');
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [newSkill, setNewSkill] = useState('');

    // Experience form
    const [expForm, setExpForm] = useState<Experience>({
        title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: ''
    });

    // Education form
    const [eduForm, setEduForm] = useState<Education>({
        school: '', degree: '', field: '', startYear: '', endYear: '', description: ''
    });

    const fetchStats = async () => {
        try {
            const res = await api.get('/network/stats');
            setConnectionCount(res.data.connectionsCount);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchMyProjects = async () => {
        try {
            if (!user?.id && !user?._id) return;
            const response = await api.get(`/projects?author=${user.id || user._id}`);
            const adaptedPosts = response.data.map((p: any) => ({
                ...p,
                id: p._id || p.id,
                likes: Array.isArray(p.likes) ? p.likes.length : (p.likes || 0),
                likedBy: Array.isArray(p.likes) ? p.likes : [],
                comments: p.comments || [],
                author: { ...p.author, id: p.author?._id || p.author?.id }
            }));
            setMyProjects(adaptedPosts);
        } catch (error) {
            console.error("Failed to fetch my projects", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyProjects();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyProjects();
        fetchStats();
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    // === ABOUT SECTION ===
    const handleSaveAbout = async () => {
        try {
            setIsSaving(true);
            const data = new FormData();
            data.append('bio', aboutText);
            await updateProfile(data);
            setAboutModalVisible(false);
            Alert.alert('Success', 'About section updated!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update about section');
        } finally {
            setIsSaving(false);
        }
    };

    // === EXPERIENCE SECTION ===
    const openExperienceModal = (exp?: Experience) => {
        if (exp) {
            setEditingExperience(exp);
            setExpForm({
                title: exp.title,
                company: exp.company,
                location: exp.location || '',
                startDate: exp.startDate,
                endDate: exp.endDate || '',
                current: exp.current || false,
                description: exp.description || ''
            });
        } else {
            setEditingExperience(null);
            setExpForm({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' });
        }
        setExperienceModalVisible(true);
    };

    const handleSaveExperience = async () => {
        if (!expForm.title || !expForm.company || !expForm.startDate) {
            Alert.alert('Error', 'Please fill in required fields (Title, Company, Start Date)');
            return;
        }

        try {
            setIsSaving(true);
            const currentExperiences = user?.experience || [];
            let updatedExperiences;

            if (editingExperience) {
                updatedExperiences = currentExperiences.map((exp: Experience) =>
                    (exp.id === editingExperience.id || exp._id === editingExperience._id)
                        ? { ...expForm, id: editingExperience.id || editingExperience._id }
                        : exp
                );
            } else {
                updatedExperiences = [...currentExperiences, { ...expForm, id: Date.now().toString() }];
            }

            const data = new FormData();
            data.append('experience', JSON.stringify(updatedExperiences));
            await updateProfile(data);
            setExperienceModalVisible(false);
            Alert.alert('Success', 'Experience saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save experience');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExperience = async (expToDelete: Experience) => {
        Alert.alert('Delete Experience', 'Are you sure you want to delete this?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        setIsSaving(true);
                        const currentExperiences = user?.experience || [];
                        const updatedExperiences = currentExperiences.filter((exp: Experience) =>
                            exp.id !== expToDelete.id && exp._id !== expToDelete._id
                        );
                        const data = new FormData();
                        data.append('experience', JSON.stringify(updatedExperiences));
                        await updateProfile(data);
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete experience');
                    } finally {
                        setIsSaving(false);
                    }
                }
            }
        ]);
    };

    // === EDUCATION SECTION ===
    const openEducationModal = (edu?: Education) => {
        if (edu) {
            setEditingEducation(edu);
            setEduForm({
                school: edu.school,
                degree: edu.degree,
                field: edu.field || '',
                startYear: edu.startYear,
                endYear: edu.endYear || '',
                description: edu.description || ''
            });
        } else {
            setEditingEducation(null);
            setEduForm({ school: '', degree: '', field: '', startYear: '', endYear: '', description: '' });
        }
        setEducationModalVisible(true);
    };

    const handleSaveEducation = async () => {
        if (!eduForm.school || !eduForm.degree || !eduForm.startYear) {
            Alert.alert('Error', 'Please fill in required fields (School, Degree, Start Year)');
            return;
        }

        try {
            setIsSaving(true);
            const currentEducation = user?.education || [];
            let updatedEducation;

            if (editingEducation) {
                updatedEducation = currentEducation.map((edu: Education) =>
                    (edu.id === editingEducation.id || edu._id === editingEducation._id)
                        ? { ...eduForm, id: editingEducation.id || editingEducation._id }
                        : edu
                );
            } else {
                updatedEducation = [...currentEducation, { ...eduForm, id: Date.now().toString() }];
            }

            const data = new FormData();
            data.append('education', JSON.stringify(updatedEducation));
            await updateProfile(data);
            setEducationModalVisible(false);
            Alert.alert('Success', 'Education saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save education');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEducation = async (eduToDelete: Education) => {
        Alert.alert('Delete Education', 'Are you sure you want to delete this?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        setIsSaving(true);
                        const currentEducation = user?.education || [];
                        const updatedEducation = currentEducation.filter((edu: Education) =>
                            edu.id !== eduToDelete.id && edu._id !== eduToDelete._id
                        );
                        const data = new FormData();
                        data.append('education', JSON.stringify(updatedEducation));
                        await updateProfile(data);
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete education');
                    } finally {
                        setIsSaving(false);
                    }
                }
            }
        ]);
    };

    // === SKILLS SECTION ===
    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;
        try {
            setIsSaving(true);
            const currentSkills = user?.skills || [];
            if (currentSkills.includes(newSkill.trim())) {
                Alert.alert('Info', 'Skill already exists');
                return;
            }
            const updatedSkills = [...currentSkills, newSkill.trim()];
            const data = new FormData();
            data.append('skills', JSON.stringify(updatedSkills));
            await updateProfile(data);
            setNewSkill('');
        } catch (error) {
            Alert.alert('Error', 'Failed to add skill');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveSkill = async (skillToRemove: string) => {
        try {
            setIsSaving(true);
            const currentSkills = user?.skills || [];
            const updatedSkills = currentSkills.filter((s: string) => s !== skillToRemove);
            const data = new FormData();
            data.append('skills', JSON.stringify(updatedSkills));
            await updateProfile(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to remove skill');
        } finally {
            setIsSaving(false);
        }
    };

    // === RENDER MODAL ===
    const renderModal = (
        visible: boolean,
        onClose: () => void,
        title: string,
        children: React.ReactNode,
        onSave: () => void
    ) => (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
                <View style={[styles.modalContent, { backgroundColor: activeColors.card }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: activeColors.border }]}>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={activeColors.muted} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: activeColors.text }]}>{title}</Text>
                        <TouchableOpacity onPress={onSave} disabled={isSaving}>
                            {isSaving ? (
                                <ActivityIndicator size="small" color={activeColors.tint} />
                            ) : (
                                <Check size={24} color={activeColors.tint} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {children}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );

    const renderInput = (label: string, value: string, onChange: (t: string) => void, placeholder: string, multiline = false) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: activeColors.text }]}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    { backgroundColor: activeColors.background, borderColor: activeColors.border, color: activeColors.text },
                    multiline && { height: 100, textAlignVertical: 'top' }
                ]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={activeColors.light}
                multiline={multiline}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            {/* Nav Header */}
            <View style={[styles.navHeader, { backgroundColor: activeColors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={activeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: activeColors.text }]}>{user?.username || 'Profile'}</Text>
                <TouchableOpacity onPress={() => router.push('/edit-profile')} style={styles.iconBtn}>
                    <Settings size={22} color={activeColors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeColors.tint} />}
            >
                {/* Header Section */}
                <View style={[styles.profileHeader, { backgroundColor: activeColors.card }]}>
                    <View style={[styles.banner, { backgroundColor: activeColors.tint + '40' }]}>
                        {user?.banner && (
                            <Image source={{ uri: getImageUrl(user.banner) || '' }} style={styles.bannerImage} />
                        )}
                        <TouchableOpacity style={styles.editBannerBtn} onPress={() => router.push('/edit-profile')}>
                            <PenTool size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileInfoContainer}>
                        <View style={[styles.avatarWrapper, { borderColor: activeColors.card, backgroundColor: activeColors.card }]}>
                            <Image
                                source={{ uri: getImageUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=A5D6B7&color=fff` }}
                                style={styles.avatar}
                            />
                        </View>

                        <TouchableOpacity style={styles.editProfileIcon} onPress={() => router.push('/edit-profile')}>
                            <Edit2 size={20} color={activeColors.muted} />
                        </TouchableOpacity>

                        <View style={styles.userDetails}>
                            <Text style={[styles.name, { color: activeColors.text }]}>{user?.firstName} {user?.lastName}</Text>
                            <Text style={[styles.headline, { color: activeColors.text }]}>{user?.headline || (user?.role === 'student' ? 'Student Entrepreneur' : 'Investor')}</Text>

                            <View style={styles.metaRow}>
                                {user?.location && (
                                    <View style={styles.metaItem}>
                                        <MapPin size={14} color={activeColors.muted} />
                                        <Text style={[styles.metaText, { color: activeColors.muted }]}>{user.location}</Text>
                                    </View>
                                )}
                                <View style={styles.metaItem}>
                                    <Users size={14} color={activeColors.tint} />
                                    <Text style={[styles.metaText, { color: activeColors.tint, fontWeight: '600' }]}>{connectionCount} connections</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={[styles.actionBtnPrimary, { backgroundColor: activeColors.tint }]}>
                                <Text style={styles.actionBtnTextPrimary}>Open to</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtnSecondary, { borderColor: activeColors.tint }]} onPress={() => router.push('/edit-profile')}>
                                <Text style={[styles.actionBtnTextSecondary, { color: activeColors.tint }]}>Edit profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Theme Switcher */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLabelContainer}>
                            {theme === 'dark' ? <Moon size={20} color={activeColors.text} /> : <Sun size={20} color={activeColors.text} />}
                            <View style={{ marginLeft: 12 }}>
                                <Text style={[styles.settingLabel, { color: activeColors.text }]}>Dark Mode</Text>
                                <Text style={[styles.settingSublabel, { color: activeColors.muted }]}>{theme === 'dark' ? 'On' : 'Off'}</Text>
                            </View>
                        </View>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: activeColors.tint }}
                            thumbColor={theme === 'dark' ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Analytics Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Analytics</Text>
                            <View style={styles.privateRow}>
                                <Eye size={12} color={activeColors.muted} />
                                <Text style={[styles.privateLabel, { color: activeColors.muted }]}>Private to you</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.analyticsGrid}>
                        <View style={styles.analyticsItem}>
                            <View style={styles.analyticsHeader}>
                                <Users size={20} color={activeColors.text} />
                                <Text style={[styles.analyticsValue, { color: activeColors.text }]}>{user?.viewedProfile || 0}</Text>
                            </View>
                            <Text style={[styles.analyticsLabel, { color: activeColors.text }]}>profile views</Text>
                            <Text style={[styles.analyticsSub, { color: activeColors.muted }]}>See who's viewed your profile.</Text>
                        </View>
                        <View style={[styles.analyticsItem, { borderLeftWidth: 1, borderLeftColor: activeColors.border }]}>
                            <View style={styles.analyticsHeader}>
                                <BarChart2 size={20} color={activeColors.text} />
                                <Text style={[styles.analyticsValue, { color: activeColors.text }]}>{user?.impressions || 0}</Text>
                            </View>
                            <Text style={[styles.analyticsLabel, { color: activeColors.text }]}>post impressions</Text>
                            <Text style={[styles.analyticsSub, { color: activeColors.muted }]}>Check out who's engaging.</Text>
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>About</Text>
                        <TouchableOpacity onPress={() => { setAboutText(user?.bio || ''); setAboutModalVisible(true); }}>
                            <Edit2 size={20} color={activeColors.muted} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.bodyText, { color: user?.bio ? activeColors.text : activeColors.muted }]}>
                        {user?.bio || "Tell your story. What drives you? What are you building?"}
                    </Text>
                </View>

                {/* Experience Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Experience</Text>
                        <TouchableOpacity onPress={() => openExperienceModal()}>
                            <Plus size={24} color={activeColors.muted} />
                        </TouchableOpacity>
                    </View>
                    {(user?.experience && user.experience.length > 0) ? (
                        user.experience.map((exp: Experience, index: number) => (
                            <View key={exp.id || exp._id || index} style={[styles.listItem, { borderTopColor: activeColors.border }]}>
                                <View style={[styles.listIcon, { backgroundColor: activeColors.tint + '20' }]}>
                                    <Briefcase size={20} color={activeColors.tint} />
                                </View>
                                <View style={styles.listContent}>
                                    <Text style={[styles.listTitle, { color: activeColors.text }]}>{exp.title}</Text>
                                    <Text style={[styles.listSubtitle, { color: activeColors.text }]}>{exp.company}</Text>
                                    <Text style={[styles.listMeta, { color: activeColors.muted }]}>
                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                    </Text>
                                    {exp.description && <Text style={[styles.listDesc, { color: activeColors.muted }]}>{exp.description}</Text>}
                                </View>
                                <View style={styles.listActions}>
                                    <TouchableOpacity onPress={() => openExperienceModal(exp)}>
                                        <Edit2 size={18} color={activeColors.muted} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteExperience(exp)}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: activeColors.muted }]}>Add your work experience to stand out.</Text>
                    )}
                </View>

                {/* Education Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Education</Text>
                        <TouchableOpacity onPress={() => openEducationModal()}>
                            <Plus size={24} color={activeColors.muted} />
                        </TouchableOpacity>
                    </View>
                    {(user?.education && user.education.length > 0) ? (
                        user.education.map((edu: Education, index: number) => (
                            <View key={edu.id || edu._id || index} style={[styles.listItem, { borderTopColor: activeColors.border }]}>
                                <View style={[styles.listIcon, { backgroundColor: activeColors.tint + '20' }]}>
                                    <GraduationCap size={20} color={activeColors.tint} />
                                </View>
                                <View style={styles.listContent}>
                                    <Text style={[styles.listTitle, { color: activeColors.text }]}>{edu.school}</Text>
                                    <Text style={[styles.listSubtitle, { color: activeColors.text }]}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</Text>
                                    <Text style={[styles.listMeta, { color: activeColors.muted }]}>
                                        {edu.startYear} - {edu.endYear || 'Present'}
                                    </Text>
                                </View>
                                <View style={styles.listActions}>
                                    <TouchableOpacity onPress={() => openEducationModal(edu)}>
                                        <Edit2 size={18} color={activeColors.muted} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteEducation(edu)}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: activeColors.muted }]}>Add your education background.</Text>
                    )}
                </View>

                {/* Skills Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Skills</Text>
                        <TouchableOpacity onPress={() => setSkillsModalVisible(true)}>
                            <Plus size={24} color={activeColors.muted} />
                        </TouchableOpacity>
                    </View>
                    {(user?.skills && user.skills.length > 0) ? (
                        <View style={styles.skillsContainer}>
                            {user.skills.map((skill: string, index: number) => (
                                <View key={index} style={[styles.skillChip, { backgroundColor: activeColors.tint + '20', borderColor: activeColors.tint }]}>
                                    <Text style={[styles.skillText, { color: activeColors.tint }]}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[styles.emptyText, { color: activeColors.muted }]}>Showcase your top skills.</Text>
                    )}
                </View>

                {/* Projects Section */}
                <View style={[styles.section, { backgroundColor: activeColors.card }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Projects</Text>
                        <TouchableOpacity onPress={() => router.push('/modal')}>
                            <Plus size={24} color={activeColors.muted} />
                        </TouchableOpacity>
                    </View>
                    {myProjects.length > 0 ? (
                        <View style={styles.projectsList}>
                            {myProjects.slice(0, 3).map((project) => (
                                <View key={project.id} style={[styles.projectItem, { borderBottomColor: activeColors.border }]}>
                                    <View style={styles.projectInfo}>
                                        <Text style={[styles.projectTitle, { color: activeColors.text }]} numberOfLines={1}>{project.title}</Text>
                                        <Text style={[styles.projectStage, { color: activeColors.tint }]}>{project.projectStage?.toUpperCase()}</Text>
                                        <Text style={[styles.projectDesc, { color: activeColors.muted }]} numberOfLines={2}>{project.content}</Text>
                                    </View>
                                    {project.media && project.media.length > 0 && (
                                        <Image source={{ uri: getImageUrl(project.media[0]) || '' }} style={styles.projectImage} />
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[styles.emptyText, { color: activeColors.muted }]}>No projects showcased yet.</Text>
                    )}
                </View>

                {/* Logout */}
                <TouchableOpacity style={[styles.logoutButton, { borderColor: '#ef4444' }]} onPress={handleLogout}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* About Modal */}
            {renderModal(aboutModalVisible, () => setAboutModalVisible(false), 'Edit About', (
                <View>
                    <Text style={[styles.modalHint, { color: activeColors.muted }]}>
                        Share your story, what you're building, and what motivates you.
                    </Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: activeColors.background, borderColor: activeColors.border, color: activeColors.text }]}
                        value={aboutText}
                        onChangeText={setAboutText}
                        placeholder="Write about yourself..."
                        placeholderTextColor={activeColors.light}
                        multiline
                        numberOfLines={6}
                    />
                </View>
            ), handleSaveAbout)}

            {/* Experience Modal */}
            {renderModal(experienceModalVisible, () => setExperienceModalVisible(false), editingExperience ? 'Edit Experience' : 'Add Experience', (
                <View>
                    {renderInput('Title *', expForm.title, (t) => setExpForm({ ...expForm, title: t }), 'Ex: Software Engineer')}
                    {renderInput('Company *', expForm.company, (t) => setExpForm({ ...expForm, company: t }), 'Ex: Google')}
                    {renderInput('Location', expForm.location || '', (t) => setExpForm({ ...expForm, location: t }), 'Ex: San Francisco, CA')}
                    {renderInput('Start Date *', expForm.startDate, (t) => setExpForm({ ...expForm, startDate: t }), 'Ex: Jan 2023')}
                    <View style={styles.checkboxRow}>
                        <TouchableOpacity
                            style={[styles.checkbox, expForm.current && { backgroundColor: activeColors.tint, borderColor: activeColors.tint }]}
                            onPress={() => setExpForm({ ...expForm, current: !expForm.current })}
                        >
                            {expForm.current && <Check size={14} color="#fff" />}
                        </TouchableOpacity>
                        <Text style={[styles.checkboxLabel, { color: activeColors.text }]}>I currently work here</Text>
                    </View>
                    {!expForm.current && renderInput('End Date', expForm.endDate || '', (t) => setExpForm({ ...expForm, endDate: t }), 'Ex: Dec 2024')}
                    {renderInput('Description', expForm.description || '', (t) => setExpForm({ ...expForm, description: t }), 'Describe your role...', true)}
                </View>
            ), handleSaveExperience)}

            {/* Education Modal */}
            {renderModal(educationModalVisible, () => setEducationModalVisible(false), editingEducation ? 'Edit Education' : 'Add Education', (
                <View>
                    {renderInput('School *', eduForm.school, (t) => setEduForm({ ...eduForm, school: t }), 'Ex: Stanford University')}
                    {renderInput('Degree *', eduForm.degree, (t) => setEduForm({ ...eduForm, degree: t }), 'Ex: Bachelor of Science')}
                    {renderInput('Field of Study', eduForm.field || '', (t) => setEduForm({ ...eduForm, field: t }), 'Ex: Computer Science')}
                    {renderInput('Start Year *', eduForm.startYear, (t) => setEduForm({ ...eduForm, startYear: t }), 'Ex: 2020')}
                    {renderInput('End Year', eduForm.endYear || '', (t) => setEduForm({ ...eduForm, endYear: t }), 'Ex: 2024')}
                    {renderInput('Description', eduForm.description || '', (t) => setEduForm({ ...eduForm, description: t }), 'Activities, achievements...', true)}
                </View>
            ), handleSaveEducation)}

            {/* Skills Modal */}
            {renderModal(skillsModalVisible, () => setSkillsModalVisible(false), 'Manage Skills', (
                <View>
                    <View style={styles.addSkillRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, backgroundColor: activeColors.background, borderColor: activeColors.border, color: activeColors.text }]}
                            value={newSkill}
                            onChangeText={setNewSkill}
                            placeholder="Add a skill..."
                            placeholderTextColor={activeColors.light}
                        />
                        <TouchableOpacity style={[styles.addSkillBtn, { backgroundColor: activeColors.tint }]} onPress={handleAddSkill}>
                            <Plus size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.skillListTitle, { color: activeColors.text }]}>Your Skills</Text>
                    <View style={styles.skillsContainer}>
                        {(user?.skills || []).map((skill: string, index: number) => (
                            <View key={index} style={[styles.skillChipRemovable, { backgroundColor: activeColors.tint + '20', borderColor: activeColors.tint }]}>
                                <Text style={[styles.skillText, { color: activeColors.tint }]}>{skill}</Text>
                                <TouchableOpacity onPress={() => handleRemoveSkill(skill)} style={styles.removeSkillBtn}>
                                    <X size={14} color={activeColors.tint} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            ), () => setSkillsModalVisible(false))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    navHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 36, paddingBottom: 12,
        height: Platform.OS === 'ios' ? 100 : 86,
    },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    iconBtn: { padding: 4 },
    scrollContent: { flexGrow: 1 },
    profileHeader: { marginBottom: 8 },
    banner: { height: 100, width: '100%', position: 'relative' },
    bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    editBannerBtn: {
        position: 'absolute', right: 16, top: 16, width: 32, height: 32, borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center',
    },
    profileInfoContainer: { paddingHorizontal: 16, paddingBottom: 20 },
    avatarWrapper: { marginTop: -60, width: 120, height: 120, borderRadius: 60, borderWidth: 4, overflow: 'hidden' },
    avatar: { width: '100%', height: '100%' },
    editProfileIcon: { position: 'absolute', top: 16, right: 16, padding: 4 },
    userDetails: { marginTop: 12 },
    name: { fontSize: 24, fontWeight: '700' },
    headline: { fontSize: 16, marginTop: 4, lineHeight: 20 },
    metaRow: { flexDirection: 'row', marginTop: 12, gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 14 },
    actionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
    actionBtnPrimary: { paddingHorizontal: 16, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    actionBtnTextPrimary: { color: '#000', fontWeight: '700', fontSize: 15 },
    actionBtnSecondary: { paddingHorizontal: 16, height: 36, borderRadius: 18, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
    actionBtnTextSecondary: { fontWeight: '700', fontSize: 15 },
    section: { padding: 16, marginBottom: 8 },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    settingLabelContainer: { flexDirection: 'row', alignItems: 'center' },
    settingLabel: { fontSize: 16, fontWeight: '600' },
    settingSublabel: { fontSize: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '700' },
    privateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    privateLabel: { fontSize: 12 },
    analyticsGrid: { flexDirection: 'row', marginTop: 8 },
    analyticsItem: { flex: 1, paddingRight: 12 },
    analyticsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    analyticsValue: { fontSize: 18, fontWeight: '700' },
    analyticsLabel: { fontSize: 14, fontWeight: '600', marginTop: 4 },
    analyticsSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
    bodyText: { fontSize: 14, lineHeight: 22 },
    emptyText: { fontSize: 14, fontStyle: 'italic' },
    listItem: { flexDirection: 'row', paddingVertical: 16, borderTopWidth: 1, gap: 12 },
    listIcon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    listContent: { flex: 1 },
    listTitle: { fontSize: 16, fontWeight: '700' },
    listSubtitle: { fontSize: 14, marginTop: 2 },
    listMeta: { fontSize: 12, marginTop: 4 },
    listDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
    listActions: { gap: 12 },
    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    skillChipRemovable: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, gap: 8 },
    skillText: { fontSize: 14, fontWeight: '600' },
    removeSkillBtn: { padding: 2 },
    projectsList: { gap: 16 },
    projectItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
    projectInfo: { flex: 1 },
    projectTitle: { fontSize: 16, fontWeight: '700' },
    projectStage: { fontSize: 11, fontWeight: '800', marginTop: 2 },
    projectDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
    projectImage: { width: 80, height: 80, borderRadius: 8 },
    logoutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: 50, borderRadius: 8, borderWidth: 1, gap: 12, marginHorizontal: 16, marginTop: 12,
    },
    logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
    // Modal styles
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalBody: { padding: 16 },
    modalHint: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 },
    textArea: { height: 150, textAlignVertical: 'top' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
    checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#666', alignItems: 'center', justifyContent: 'center' },
    checkboxLabel: { fontSize: 15 },
    addSkillRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    addSkillBtn: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    skillListTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
});
