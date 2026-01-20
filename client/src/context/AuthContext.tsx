import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (userData: Partial<User> & { password: string }) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockUser: User = {
    id: '1',
    email: 'alex@example.com',
    firstName: 'Alex',
    lastName: 'Johnson',
    username: 'alexj',
    bio: 'Building the future of education technology. Stanford CS student.',
    role: 'student',
    interests: ['technology', 'education', 'ai-ml'],
    createdAt: '2025-09-15T10:00:00Z',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        loading: true,
    });

    useEffect(() => {
        // Check for saved auth state
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setState({
                user: JSON.parse(savedUser),
                isAuthenticated: true,
                loading: false,
            });
        } else {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const login = async (email: string, password: string) => {
        // Mock login - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = { ...mockUser, email };
        localStorage.setItem('user', JSON.stringify(user));
        setState({
            user,
            isAuthenticated: true,
            loading: false,
        });
    };

    const register = async (userData: Partial<User> & { password: string }) => {
        // Mock registration - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newUser: User = {
            id: Date.now().toString(),
            email: userData.email || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || userData.email?.split('@')[0] || '',
            role: userData.role || 'student',
            interests: userData.interests || [],
            createdAt: new Date().toISOString(),
        };

        localStorage.setItem('user', JSON.stringify(newUser));
        setState({
            user: newUser,
            isAuthenticated: true,
            loading: false,
        });
    };

    const logout = () => {
        localStorage.removeItem('user');
        setState({
            user: null,
            isAuthenticated: false,
            loading: false,
        });
    };

    const updateProfile = (data: Partial<User>) => {
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
