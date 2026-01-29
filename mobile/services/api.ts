
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android Emulator, localhost is 10.0.2.2
// For physical devices, you should use your machine's local IP address
// Use your machine's local IP address (192.168.0.135) so both simulators and physical devices can connect
const API_URL = 'http://192.168.0.135:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            }
        } catch (error) {
            console.error('Error fetching token from storage', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
