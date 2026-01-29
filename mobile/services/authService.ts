
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async (userData: any) => {
    const response = await api.post('/auth/login', userData);
    if (response.data) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = async () => {
    await AsyncStorage.removeItem('user');
};

const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

const getProfile = async (username: string) => {
    const response = await api.get(`/auth/profile/${username}`);
    return response.data;
};

const updateProfile = async (userData: any) => {
    const isFormData = userData instanceof FormData;
    const response = await api.put('/auth/profile', userData, {
        headers: {
            'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        },
    });
    if (response.data) {
        const userStr = await AsyncStorage.getItem('user');
        const savedUser = JSON.parse(userStr || '{}');
        const updatedUser = { ...savedUser, ...response.data };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
};

const authService = {
    login,
    register,
    logout,
    getMe,
    getProfile,
    updateProfile,
};

export default authService;
