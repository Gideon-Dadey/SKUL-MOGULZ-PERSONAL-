import api from './api';


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

// Get any user profile by username
const getProfile = async (username: string) => {
    const response = await api.get(`/auth/profile/${username}`);
    return response.data;
};

// Update current user profile
const updateProfile = async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    if (response.data) {
        // Update local storage too so it persists
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...savedUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
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
