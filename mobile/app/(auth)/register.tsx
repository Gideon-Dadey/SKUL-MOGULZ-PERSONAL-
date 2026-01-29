
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { User, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.brandText, { color: activeColors.tint }]}>SKUL MOGULZ</Text>
                    <Text style={[styles.title, { color: activeColors.text }]}>Join the innovation</Text>
                    <Text style={[styles.subtitle, { color: activeColors.muted }]}>
                        Already have an account? <Link href="/(auth)/login" style={{ color: activeColors.tint, fontWeight: '600' }}>Sign in</Link>
                    </Text>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {step === 1 ? (
                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={[styles.label, { color: activeColors.muted }]}>First name</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                                    <TextInput
                                        style={[styles.input, { color: activeColors.text }]}
                                        placeholder="John"
                                        placeholderTextColor={activeColors.light}
                                        value={formData.firstName}
                                        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                <Text style={[styles.label, { color: activeColors.muted }]}>Last name</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
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

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: activeColors.muted }]}>Email</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                                <Mail size={20} color={activeColors.light} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: activeColors.text }]}
                                    placeholder="your@email.com"
                                    placeholderTextColor={activeColors.light}
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: activeColors.muted }]}>Password (6+ characters)</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
                                <Lock size={20} color={activeColors.light} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: activeColors.text }]}
                                    placeholder="••••••••"
                                    placeholderTextColor={activeColors.light}
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: activeColors.tint }]}
                            onPress={handleContinue}
                        >
                            <Text style={styles.buttonText}>Continue</Text>
                            <ArrowRight size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <Text style={[styles.stepInfo, { color: activeColors.text }]}>What describes you best?</Text>

                        <TouchableOpacity
                            style={[styles.roleOption, { backgroundColor: activeColors.card, borderColor: formData.role === 'student' ? activeColors.tint : activeColors.border }]}
                            onPress={() => setFormData({ ...formData, role: 'student' })}
                        >
                            <Text style={styles.roleIcon}>🎓</Text>
                            <View style={styles.roleContent}>
                                <Text style={[styles.roleTitle, { color: activeColors.text }]}>Student / Founder</Text>
                                <Text style={[styles.roleDesc, { color: activeColors.muted }]}>I'm building or want to build a startup</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.roleOption, { backgroundColor: activeColors.card, borderColor: formData.role === 'investor' ? activeColors.tint : activeColors.border }]}
                            onPress={() => setFormData({ ...formData, role: 'investor' })}
                        >
                            <Text style={styles.roleIcon}>💼</Text>
                            <View style={styles.roleContent}>
                                <Text style={[styles.roleTitle, { color: activeColors.text }]}>Investor / Mentor</Text>
                                <Text style={[styles.roleDesc, { color: activeColors.muted }]}>I want to discover and invest in prometing talent</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.outlineButton, { borderColor: activeColors.border }]}
                                onPress={() => setStep(1)}
                            >
                                <ArrowLeft size={20} color={activeColors.text} />
                                <Text style={[styles.outlineButtonText, { color: activeColors.text }]}>Back</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: activeColors.tint, flex: 2 }]}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create account'}</Text>
                                {!loading && <ArrowRight size={20} color="#fff" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
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
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
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
    button: {
        height: 56,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    outlineButton: {
        flex: 1,
        height: 56,
        borderRadius: 100,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    stepInfo: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        gap: 16,
    },
    roleIcon: {
        fontSize: 32,
    },
    roleContent: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    roleDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
    },
});
