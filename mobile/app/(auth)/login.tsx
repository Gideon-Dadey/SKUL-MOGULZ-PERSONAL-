
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../components/Logo';

export default function LoginScreen() {
    const { login } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const activeColors = Colors[theme];
    const isDark = theme === 'dark';

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: '#ffffff' }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroSection}>
                    <View style={[styles.logoContainer, { backgroundColor: isDark ? 'rgba(165, 214, 183, 0.1)' : 'rgba(165, 214, 183, 0.05)' }]}>
                        <Logo size={80} />
                    </View>
                    <Text style={[styles.brandText, { color: activeColors.tint }]}>Skul Mogulz</Text>
                    <Text style={[styles.heroTitle, { color: activeColors.text }]}>Propel Your{'\n'}Student Vision</Text>
                    <Text style={[styles.heroSubtitle, { color: activeColors.muted }]}>
                        Connecting university innovators with high-impact investment.
                    </Text>
                </View>

                <View style={[styles.authCard, { backgroundColor: '#ffffff', shadowColor: '#000' }]}>
                    <Text style={[styles.formTitle, { color: activeColors.text }]}>Sign In</Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: activeColors.muted }]}>Professional email</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0d1117' : '#f8f9fa', borderColor: activeColors.border }]}>
                                <Mail size={18} color={activeColors.tint} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: activeColors.text }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={[styles.inputLabel, { color: activeColors.muted }]}>Password</Text>
                                <TouchableOpacity>
                                    <Text style={[styles.forgotLink, { color: activeColors.tint }]}>Reset?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0d1117' : '#f8f9fa', borderColor: activeColors.border }]}>
                                <Lock size={18} color={activeColors.tint} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: activeColors.text }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: activeColors.tint }]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>{loading ? 'Authenticating...' : 'Enter Dashboard'}</Text>
                            {!loading && <ArrowRight size={20} color="#000" />}
                        </TouchableOpacity>

                        <View style={styles.authDivider}>
                            <View style={[styles.dividerLine, { backgroundColor: activeColors.border }]} />
                            <Text style={[styles.dividerLabel, { color: activeColors.light }]}>Or continue with</Text>
                            <View style={[styles.dividerLine, { backgroundColor: activeColors.border }]} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity style={[styles.socialIconBtn, { backgroundColor: isDark ? '#0d1117' : '#f8f9fa', borderColor: activeColors.border }]}>
                                <Text style={[styles.socialBtnLabel, { color: activeColors.text }]}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialIconBtn, { backgroundColor: isDark ? '#0d1117' : '#f8f9fa', borderColor: activeColors.border }]}>
                                <Text style={[styles.socialBtnLabel, { color: activeColors.text }]}>GitHub</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: activeColors.muted }]}>
                        New to the network?
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text style={[styles.footerLink, { color: activeColors.tint }]}> Create Professional Account</Text>
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
        padding: 20,
        borderRadius: 0.5,
        marginBottom: 20,
    },
    brandText: {
        fontSize: 14,
        fontWeight: '900',
        marginBottom: 12,
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 44,
        marginBottom: 16,
    },
    heroSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    authCard: {
        borderRadius: 8,
        padding: 28,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 24,
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 6,
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
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '800',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forgotLink: {
        fontSize: 11,
        fontWeight: '700',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 8,
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
    primaryButton: {
        height: 60,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '800',
    },
    authDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerLabel: {
        paddingHorizontal: 12,
        fontSize: 10,
        fontWeight: '700',
    },
    socialRow: {
        flexDirection: 'row',
        gap: 12,
    },
    socialIconBtn: {
        flex: 1,
        height: 52,
        borderRadius: 8,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialBtnLabel: {
        fontSize: 14,
        fontWeight: '700',
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
