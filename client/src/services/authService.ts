import api from './api';



const mapUserIds = (user: any) => {
    if (!user) return user;
    if (user.experience) {
        user.experience = user.experience.map((exp: any) => ({ ...exp, id: exp._id || exp.id }));
    }
    if (user.education) {
        user.education = user.education.map((edu: any) => ({ ...edu, id: edu._id || edu.id }));
    }
    return user;
};

const login = async (userData: any) => {
    const response = await api.post('/auth/login', userData);
    if (response.data) {
        const user = mapUserIds(response.data);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    }
    return response.data;
};


const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data) {
        const user = mapUserIds(response.data);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    }
    return response.data;
};


const logout = () => {
    localStorage.removeItem('user');
};


const getMe = async () => {
    const response = await api.get('/auth/me');
    return mapUserIds(response.data);
};


const getProfile = async (username: string) => {
    const response = await api.get(`/auth/profile/${username}`);
    return mapUserIds(response.data);
};


const updateProfile = async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    if (response.data) {
        const updatedResponse = mapUserIds(response.data);
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...savedUser, ...updatedResponse };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedResponse;
    }
    return response.data;
};

const toggleBookmark = async (projectId: string) => {
    const response = await api.put(`/projects/${projectId}/bookmark`);
    if (response.data) {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...savedUser, bookmarks: response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return response.data;
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
    toggleBookmark,
};

export default authService;
