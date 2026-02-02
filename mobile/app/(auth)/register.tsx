
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
    const { register } = useAuth();
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
            style={styles.container}
        >
            <StatusBar style="dark" />
            <View style={StyleSheet.absoluteFill}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#f8fff9" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGrad)" />
                </Svg>
            </View>
            <View style={styles.header}>
                <Logo size={30} />
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                        <Text style={styles.headerLink}>Sign in</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Join Skul Mogulz</Text>
                    <Text style={styles.subtitle}>Make the most of your professional life</Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {step === 1 ? (
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>First name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.firstName}
                                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Last name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.lastName}
                                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Password (6+ characters)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    secureTextEntry
                                />
                            </View>

                            <Text style={styles.disclaimer}>
                                By clicking Agree & Join, you agree to the Skul Mogulz User Agreement, Privacy Policy, and Cookie Policy.
                            </Text>

                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleContinue}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.submitBtnText}>Agree & Join</Text>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity style={styles.socialBtn}>
                                <Image
                                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                                    style={styles.socialIcon}
                                />
                                <Text style={styles.socialBtnText}>Continue with Google</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.form}>
                            <Text style={styles.stepTitle}>What describes you best?</Text>
                            <Text style={styles.stepSubtitle}>We'll help you find the right people and opportunities.</Text>

                            <TouchableOpacity
                                style={[styles.roleOption, formData.role === 'student' && styles.roleOptionSelected]}
                                onPress={() => setFormData({ ...formData, role: 'student' })}
                            >
                                <View style={styles.roleContent}>
                                    <Text style={styles.roleTitle}>I'm a Student</Text>
                                    <Text style={styles.roleDesc}>Looking to build, innovate, and find funding.</Text>
                                </View>
                                <View style={[styles.radioOuter, formData.role === 'student' && styles.radioOuterSelected]}>
                                    {formData.role === 'student' && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.roleOption, formData.role === 'investor' && styles.roleOptionSelected]}
                                onPress={() => setFormData({ ...formData, role: 'investor' })}
                            >
                                <View style={styles.roleContent}>
                                    <Text style={styles.roleTitle}>I'm an Investor</Text>
                                    <Text style={styles.roleDesc}>Looking for the next big campus startup.</Text>
                                </View>
                                <View style={[styles.radioOuter, formData.role === 'investor' && styles.radioOuterSelected]}>
                                    {formData.role === 'investor' && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.navButtons}>
                                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                                    <ArrowLeft size={24} color="#666" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitBtn, { flex: 1, marginLeft: 16 }]}
                                    onPress={handleRegister}
                                    disabled={loading}
                                >
                                    <Text style={styles.submitBtnText}>{loading ? 'Creating account...' : 'Complete profile'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 10,
    },
    headerLink: {
        color: '#2D5F3F', // Darker green for visibility
        fontSize: 16,
        fontWeight: '700',
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 30,
        fontWeight: '400',
        color: '#000000e6',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#00000099',
        marginBottom: 32,
    },
    errorContainer: {
        backgroundColor: '#ffebe6',
        padding: 12,
        borderRadius: 4,
        marginBottom: 20,
    },
    errorText: {
        color: '#d93025',
        fontSize: 14,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#00000099',
        borderRadius: 4,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#000',
    },
    disclaimer: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginVertical: 12,
        lineHeight: 18,
    },
    submitBtn: {
        backgroundColor: '#A5D6B7',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: '#FFFFFF', // White text for better contrast
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#00000014',
    },
    dividerText: {
        paddingHorizontal: 16,
        color: '#00000099',
        fontSize: 14,
    },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderWidth: 1,
        borderColor: '#00000099',
        borderRadius: 26,
        backgroundColor: '#fff',
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        resizeMode: 'contain',
    },
    socialBtnText: {
        color: '#00000099',
        fontSize: 16,
        fontWeight: '600',
    },
    // Step 2 styles
    stepTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000000e6',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00000026', // Light gray border
        marginBottom: 16,
    },
    roleOptionSelected: {
        borderColor: '#A5D6B7',
        borderWidth: 2,
        backgroundColor: 'rgba(165, 214, 183, 0.1)',
    },
    roleContent: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000e6',
        marginBottom: 4,
    },
    roleDesc: {
        fontSize: 14,
        color: '#666',
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#666',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
    },
    radioOuterSelected: {
        borderColor: '#A5D6B7',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2D5F3F', // Darker green for visibility
    },
    navButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    backBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: '#666',
        alignItems: 'center',
        justifyContent: 'center',
    },
});


