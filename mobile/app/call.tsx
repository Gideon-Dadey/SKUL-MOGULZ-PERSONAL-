import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, StatusBar, SafeAreaView, AppState, AppStateStatus } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Camera } from 'lucide-react-native';

export default function CallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { roomId, partnerName, isVideo } = useLocalSearchParams<{ roomId: string; partnerName: string; isVideo: string }>();
    const webViewRef = useRef<WebView>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(isVideo !== 'true');
    const [callDuration, setCallDuration] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    // Call timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isConnected) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isConnected]);

    // Handle app state (if user leaves and comes back)
    useEffect(() => {
        const handleAppState = (nextState: AppStateStatus) => {
            if (nextState === 'active' && webViewRef.current) {
                // Reload or resume if needed
            }
        };

        const subscription = AppState.addEventListener('change', handleAppState);
        return () => subscription.remove();
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        router.back();
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        webViewRef.current?.injectJavaScript(`
            try {
                const api = window.JitsiMeetExternalAPI;
                if (api && api.executeCommand) {
                    api.executeCommand('toggleAudio');
                }
            } catch(e) {}
            true;
        `);
    };

    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        webViewRef.current?.injectJavaScript(`
            try {
                const api = window.JitsiMeetExternalAPI;
                if (api && api.executeCommand) {
                    api.executeCommand('toggleVideo');
                }
            } catch(e) {}
            true;
        `);
    };

    const switchCamera = () => {
        webViewRef.current?.injectJavaScript(`
            try {
                const api = window.JitsiMeetExternalAPI;
                if (api && api.executeCommand) {
                    api.executeCommand('toggleCamera');
                }
            } catch(e) {}
            true;
        `);
    };

    // Construct Jitsi URL with parameters to make it feel like a 1:1 call
    const jitsiUrl = `https://meet.jit.si/${roomId}#config.prejoinPageEnabled=false&config.disableInviteFunctions=true&config.disableDeepLinking=true&config.enableWelcomePage=false&config.toolbarButtons=[]&config.hideConferenceSubject=true&config.hideConferenceTimer=true&config.hideLobbyButton=true&config.startWithVideoMuted=${isVideo !== 'true'}&interfaceConfig.TOOLBAR_BUTTONS=[]&interfaceConfig.MOBILE_APP_PROMO=false`;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Call Header */}
            <View style={styles.header}>
                <Text style={styles.partnerName}>{partnerName || 'Unknown'}</Text>
                <Text style={styles.callStatus}>
                    {isConnected ? formatDuration(callDuration) : 'Connecting...'}
                </Text>
            </View>

            {/* Jitsi WebView - Hidden toolbar, behaves like WhatsApp */}
            <View style={styles.webviewContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: jitsiUrl }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback={true}
                    startInLoadingState={true}
                    originWhitelist={['*']}
                    onLoad={() => setIsConnected(true)}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView error: ', nativeEvent);
                    }}
                    allowsFullscreenVideo={true}
                    // Hide Jitsi's own controls by injecting CSS
                    injectedJavaScript={`
                        (function() {
                            const style = document.createElement('style');
                            style.innerHTML = \`
                                .toolbox-content-items,
                                .subject,
                                .new-toolbox,
                                .filmstrip__videos,
                                .invite-more-button,
                                .toolbox-button,
                                #sideToolbarContainer,
                                .participants-pane-button,
                                [class*="toolbar"],
                                [class*="Toolbox"],
                                [class*="bottom-bar"] {
                                    display: none !important;
                                    opacity: 0 !important;
                                    visibility: hidden !important;
                                    height: 0 !important;
                                    pointer-events: none !important;
                                }
                                .large-video-container {
                                    border-radius: 0 !important;
                                }
                            \`;
                            document.head.appendChild(style);
                        })();
                        true;
                    `}
                />
            </View>

            {/* Custom WhatsApp-style Controls */}
            <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
                    {isMuted ? (
                        <MicOff size={28} color="#fff" />
                    ) : (
                        <Mic size={28} color="#fff" />
                    )}
                    <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                </TouchableOpacity>

                {isVideo === 'true' && (
                    <>
                        <TouchableOpacity style={styles.controlBtn} onPress={toggleVideo}>
                            {isVideoOff ? (
                                <VideoOff size={28} color="#fff" />
                            ) : (
                                <Video size={28} color="#fff" />
                            )}
                            <Text style={styles.controlLabel}>{isVideoOff ? 'Video On' : 'Video Off'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlBtn} onPress={switchCamera}>
                            <Camera size={28} color="#fff" />
                            <Text style={styles.controlLabel}>Flip</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity style={[styles.controlBtn, styles.endCallBtn]} onPress={handleEndCall}>
                    <PhoneOff size={32} color="#fff" />
                    <Text style={styles.controlLabel}>End</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 10,
    },
    partnerName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    callStatus: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
    },
    webviewContainer: {
        flex: 1,
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    webview: {
        flex: 1,
        backgroundColor: '#000',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    controlBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    controlLabel: {
        color: '#fff',
        fontSize: 11,
        marginTop: 6,
        fontWeight: '500',
    },
    endCallBtn: {
        backgroundColor: '#ef4444',
    },
});
