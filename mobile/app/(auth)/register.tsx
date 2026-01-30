
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../components/Logo';

export default function RegisterScreen() {
    const { register } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student' as 'student' | 'investor',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const activeColors = Colors[theme];
    const isDark = theme === 'dark';

    const handleContinue = () => {
        if (step === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
                setError('Please fill in all fields');
                return;
            }
            setStep(2);
            setError('');
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        setError('');
        try {
            await register(formData);
            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: activeColors.background }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <View style={[styles.logoContainer, { backgroundColor: isDark ? 'rgba(165, 214, 183, 0.1)' : 'rgba(165, 214, 183, 0.05)' }]}>
                        <Logo size={60} />
                    </View>
                    <Text style={[styles.brandText, { color: activeColors.tint }]}>SKUL MOGULZ</Text>
                    <Text style={[styles.heroTitle, { color: activeColors.text }]}>Start Your{'\n'}Mogul Journey</Text>

                    <View style={styles.stepIndicator}>
                        <View style={[styles.stepDot, { backgroundColor: activeColors.tint }]} />
                        <View style={[styles.stepLine, { backgroundColor: step === 2 ? activeColors.tint : activeColors.border }]} />
                        <View style={[styles.stepDot, { backgroundColor: step === 2 ? activeColors.tint : activeColors.border }]} />
                    </View>
                </View>

                <View style={[styles.authCard, { backgroundColor: isDark ? '#161b22' : '#ffffff', shadowColor: isDark ? '#000' : '#888' }]}>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {step === 1 ? (
                        <View style={styles.formContainer}>
                            <Text style={[styles.formTitle, { color: activeColors.text }]}>Personal Details</Text>

                            <View style={styles.inputRow}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.inputLabel, { color: activeColors.muted }]}>FIRST NAME</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0d1117' : '#f8f9fa', borderColor: activeColors.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: activeColors.text }]}
                                            placeholder="John"
                                            placeholderTextColor={activeColors.light}
                                            value={formData.firstName}
                                            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.inputLabel, { color: activeColors.muted }]}>LAST NAME</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0d1117' : '#f8f9fa', borderColor: activeColors.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: activeColors.text }]}
                                            placeholder="Doe"
                                            placeholderTextColor={activeColors.light}
                                            value={formData.lastName}
                                            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: activeColors.muted }]}>INSTITUTIONAL EMAIL</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0d1117' : '#f8f9fa', borderColor: activeColors.border }]}>
                                    <Mail size={18} color={activeColors.tint} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: activeColors.text }]}
                                        placeholder="your@university.edu"
                                        placeholderTextColor={activeColors.light}
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: activeColors.muted }]}>SECURITY KEY</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0d1117' : '#f8f9fa', borderColor: activeColors.border }]}>
                                    <Lock size={18} color={activeColors.tint} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: activeColors.text }]}
                                        placeholder="6+ complex characters"
                                        placeholderTextColor={activeColors.light}
                                        value={formData.password}
                                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: activeColors.tint }]}
                                onPress={handleContinue}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryButtonText}>Continue Excellence</Text>
                                <ArrowRight size={20} color="#000" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.formContainer}>
                            <Text style={[styles.formTitle, { color: activeColors.text }]}>Select Your Perspective</Text>
                            <Text style={[styles.formSubtitle, { color: activeColors.muted }]}>How will you contribute to the mogul ecosystem?</Text>

                            <View style={styles.roleGrid}>
                                <TouchableOpacity
                                    style={[
                                        styles.premiumRoleOption,
                                        {
                                            backgroundColor: isDark ? '#0d1117' : '#f8f9fa',
                                            borderColor: formData.role === 'student' ? activeColors.tint : activeColors.border
                                        }
                                    ]}
                                    onPress={() => setFormData({ ...formData, role: 'student' })}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.roleIconBadge, { backgroundColor: formData.role === 'student' ? 'rgba(165, 214, 183, 0.2)' : 'rgba(0,0,0,0.05)' }]}>
                                        <Text style={styles.roleEmoji}>🎓</Text>
                                    </View>
                                    <Text style={[styles.premiumRoleTitle, { color: activeColors.text }]}>Innovation Leader</Text>
                                    <Text style={[styles.premiumRoleDesc, { color: activeColors.muted }]}>Building and scaling the next generation of campus startups.</Text>
                                    {formData.role === 'student' && <View style={[styles.selectionDot, { backgroundColor: activeColors.tint }]} />}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.premiumRoleOption,
                                        {
                                            backgroundColor: isDark ? '#0d1117' : '#f8f9fa',
                                            borderColor: formData.role === 'investor' ? activeColors.tint : activeColors.border
                                        }
                                    ]}
                                    onPress={() => setFormData({ ...formData, role: 'investor' })}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.roleIconBadge, { backgroundColor: formData.role === 'investor' ? 'rgba(165, 214, 183, 0.2)' : 'rgba(0,0,0,0.05)' }]}>
                                        <Text style={styles.roleEmoji}>💼</Text>
                                    </View>
                                    <Text style={[styles.premiumRoleTitle, { color: activeColors.text }]}>Venture Partner</Text>
                                    <Text style={[styles.premiumRoleDesc, { color: activeColors.muted }]}>Identifying and mentoring elite student-led opportunities.</Text>
                                    {formData.role === 'investor' && <View style={[styles.selectionDot, { backgroundColor: activeColors.tint }]} />}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.multiButtonRow}>
                                <TouchableOpacity
                                    style={[styles.secondaryButton, { borderColor: activeColors.border }]}
                                    onPress={() => setStep(1)}
                                >
                                    <ArrowLeft size={20} color={activeColors.text} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: activeColors.tint, flex: 1 }]}
                                    onPress={handleRegister}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.primaryButtonText}>{loading ? 'Establishing...' : 'Confirm Identity'}</Text>
                                    {!loading && <ArrowRight size={20} color="#000" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: activeColors.muted }]}>
                        Part of the elite?
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={[styles.footerLink, { color: activeColors.tint }]}> Sign In Instead</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingBottom: 40,
    },
    heroSection: {
        marginTop: 40,
        marginBottom: 32,
        alignItems: 'center',
    },
    logoContainer: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
    },
    brandText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 20,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    stepLine: {
        width: 40,
        height: 2,
        borderRadius: 1,
    },
    authCard: {
        borderRadius: 32,
        padding: 28,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    formContainer: {
        gap: 20,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    roleGrid: {
        gap: 16,
    },
    premiumRoleOption: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        position: 'relative',
    },
    roleIconBadge: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    roleEmoji: {
        fontSize: 24,
    },
    premiumRoleTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    premiumRoleDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    selectionDot: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    primaryButton: {
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    primaryButtonText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '800',
    },
    secondaryButton: {
        width: 60,
        height: 60,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    multiButtonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    footer: {
        marginTop: 32,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontWeight: '500',
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '700',
    },
});
