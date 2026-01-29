
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';
import authService from '../services/authService';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        loading: true,
    });

    useEffect(() => {
        const loadStoredUser = async () => {
            try {
                const savedUser = await AsyncStorage.getItem('user');
                if (savedUser) {
                    const user = JSON.parse(savedUser);
                    if (user._id && !user.id) user.id = user._id;
                    setState({
                        user,
                        isAuthenticated: true,
                        loading: false,
                    });
                } else {
                    setState(prev => ({ ...prev, loading: false }));
                }
            } catch (err) {
                console.error("Failed to load user from storage", err);
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        loadStoredUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await authService.login({ email, password });
            const user = { ...data, id: data._id || data.id };
            setState({
                user,
                isAuthenticated: true,
                loading: false,
            });
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (userData: any) => {
        try {
            const data = await authService.register(userData);
            const user = { ...data, id: data._id || data.id };
            setState({
                user,
                isAuthenticated: true,
                loading: false,
            });
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = async () => {
        await authService.logout();
        setState({
            user: null,
            isAuthenticated: false,
            loading: false,
        });
    };

    const updateProfile = async (data: any) => {
        try {
            const updatedUser = await authService.updateProfile(data);
            const user = { ...updatedUser, id: updatedUser._id || updatedUser.id };
            setState(prev => ({ ...prev, user }));
        } catch (error) {
            console.error("Profile update failed", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
