import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import authService from '../services/authService';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (userData: Partial<User> & { password: string }) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        loading: true,
    });

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                // Ensure id field exists (map _id if needed)
                if (user._id && !user.id) user.id = user._id;

                setState({
                    user: user,
                    isAuthenticated: true,
                    loading: false,
                });
            } catch (err) {
                console.error("Failed to parse user from local storage", err);
                localStorage.removeItem('user');
                setState(prev => ({ ...prev, loading: false }));
            }
        } else {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await authService.login({ email, password });
            // Adapt backend response to frontend User type
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

    const register = async (userData: Partial<User> & { password: string }) => {
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

    const logout = () => {
        authService.logout();
        setState({
            user: null,
            isAuthenticated: false,
            loading: false,
        });
    };

    const updateProfile = (data: Partial<User>) => {
        // TODO: Implement backend update
        if (state.user) {
            const updatedUser = { ...state.user, ...data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setState(prev => ({ ...prev, user: updatedUser }));
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
