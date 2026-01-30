
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
            style={[styles.container, { backgroundColor: activeColors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Logo size={60} />
                    <Text style={[styles.brandText, { color: activeColors.tint }]}>SKUL MOGULZ</Text>
                    <Text style={[styles.title, { color: activeColors.text }]}>Welcome back</Text>
                    <Text style={[styles.subtitle, { color: activeColors.muted }]}>
                        Don't have an account? <Link href="/(auth)/register" style={{ color: activeColors.tint, fontWeight: '600' }}>Join now</Link>
                    </Text>
                </View>

                <View style={styles.form}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: activeColors.muted }]}>Email or username</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                            <Mail size={20} color={activeColors.light} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: activeColors.text }]}
                                placeholder="Enter your email"
                                placeholderTextColor={activeColors.light}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.label, { color: activeColors.muted }]}>Password</Text>
                            <TouchableOpacity>
                                <Text style={[styles.forgotText, { color: activeColors.tint }]}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.inputWrapper, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                            <Lock size={20} color={activeColors.light} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: activeColors.text }]}
                                placeholder="Enter your password"
                                placeholderTextColor={activeColors.light}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: activeColors.tint }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
                        {!loading && <ArrowRight size={20} color="#fff" />}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: activeColors.border }]} />
                        <Text style={[styles.dividerText, { color: activeColors.muted }]}>or</Text>
                        <View style={[styles.dividerLine, { backgroundColor: activeColors.border }]} />
                    </View>

                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                        <Text style={[styles.socialButtonText, { color: activeColors.text }]}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                        <Text style={[styles.socialButtonText, { color: activeColors.text }]}>Continue with GitHub</Text>
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
        paddingTop: 80,
    },
    header: {
        marginBottom: 40,
    },
    brandText: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
        gap: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forgotText: {
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    loginButton: {
        height: 56,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        paddingHorizontal: 16,
        fontSize: 14,
    },
    socialButton: {
        height: 56,
        borderRadius: 100,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
    },
});
