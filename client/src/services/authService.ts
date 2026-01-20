import api from './api';
import { User } from '../types';

// Login user
const login = async (userData: any) => {
    const response = await api.post('/auth/login', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Register user
const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

// Get current user profile
const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

const authService = {
    login,
    register,
    logout,
    getMe,
};

export default authService;
