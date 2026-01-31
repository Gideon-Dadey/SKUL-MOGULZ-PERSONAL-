
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    themePreference: ThemePreference;
    setThemePreference: (pref: ThemePreference) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>('light');
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('themePreference');
            if (savedTheme) {
                setThemePreferenceState(savedTheme as ThemePreference);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        if (themePreference === 'system') {
            setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
        } else {
            setTheme(themePreference);
        }
    }, [themePreference, systemColorScheme]);

    const setThemePreference = async (pref: ThemePreference) => {
        setThemePreferenceState(pref);
        await AsyncStorage.setItem('themePreference', pref);
    };

    const toggleTheme = async () => {
        const newPref = theme === 'light' ? 'dark' : 'light';
        await setThemePreference(newPref);
    };

    return (
        <ThemeContext.Provider value={{ theme, themePreference, setThemePreference, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
