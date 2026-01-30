import api from './api';

const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

const markAsRead = async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
};

const markAllAsRead = async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
};

const notificationService = {
    getNotifications,
    markAsRead,
    markAllAsRead,
};

export default notificationService;
