import api from './api';

const getConversations = async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
};

const getMessages = async (userId: string) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
};

const sendMessage = async (recipientId: string, content: string) => {
    const response = await api.post('/messages', { recipientId, content });
    return response.data;
};

const messageService = {
    getConversations,
    getMessages,
    sendMessage,
};

export default messageService;
