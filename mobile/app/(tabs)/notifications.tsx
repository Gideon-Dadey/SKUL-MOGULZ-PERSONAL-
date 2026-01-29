
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/Colors';

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const activeColors = Colors[theme];

    return (
        <View style={[styles.container, { backgroundColor: activeColors.background }]}>
            <Text style={[styles.title, { color: activeColors.text }]}>Notifications</Text>
            <Text style={[styles.subtitle, { color: activeColors.muted }]}>Stay updated on likes, comments, and project milestones.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
});
