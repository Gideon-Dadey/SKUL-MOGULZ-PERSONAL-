import api from './api';

const getSuggestions = async () => {
    const response = await api.get('/network/suggestions');
    return response.data;
};

const getInvitations = async () => {
    const response = await api.get('/network/invitations');
    return response.data;
};

const sendRequest = async (recipientId: string) => {
    const response = await api.post('/network/request', { recipientId });
    return response.data;
};

const acceptRequest = async (requestId: string) => {
    const response = await api.put(`/network/request/${requestId}/accept`);
    return response.data;
};

const networkService = {
    getSuggestions,
    getInvitations,
    sendRequest,
    acceptRequest,
};

export default networkService;
