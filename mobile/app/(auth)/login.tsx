
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                <Logo size={32} />
                <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                        <Text style={styles.headerLink}>Join now</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Sign in</Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email or Phone"
                                placeholderTextColor="#666"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#666"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            <TouchableOpacity style={styles.showPasswordBtn}>
                                <Text style={styles.showPasswordText}>Show</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitBtn, { opacity: (email && password) ? 1 : 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.submitBtnText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.socialBtn}>
                            <Image
                                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                                style={styles.socialIcon}
                            />
                            <Text style={styles.socialBtnText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialBtn}>
                            <Image
                                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' }}
                                style={styles.socialIcon}
                            />
                            <Text style={styles.socialBtnText}>Continue with Apple</Text>
                        </TouchableOpacity>
                    </View>
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
        color: '#2D5F3F', // Darker green for better readability
        fontSize: 16,
        fontWeight: '700',
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#000000e6', // ~90% black
        marginBottom: 24,
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
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 20,
        position: 'relative',
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#00000099', // ~60% black
        borderRadius: 4,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000',
    },
    showPasswordBtn: {
        position: 'absolute',
        right: 12,
        top: 16,
    },
    showPasswordText: {
        color: '#A5D6B7',
        fontWeight: '600',
        fontSize: 14,
    },
    forgotPassword: {
        marginTop: -8,
        marginBottom: 24,
        alignSelf: 'flex-start',
    },
    forgotPasswordText: {
        color: '#2D5F3F', // Darker green for better readability
        fontWeight: '600',
        fontSize: 16,
    },
    submitBtn: {
        backgroundColor: '#A5D6B7',
        height: 52,
        borderRadius: 26, // Fully rounded
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: '#FFFFFF', // White text on green button for better contrast
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#00000014', // ~8% black
    },
    dividerText: {
        paddingHorizontal: 16,
        color: '#00000099',
        fontSize: 14,
    },
    socialButtons: {
        gap: 12,
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
});


