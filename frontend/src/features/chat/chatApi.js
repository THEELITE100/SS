import axiosInstance from '../../api/axiosInstance';

export const chatApi = {
  listConversations: () => axiosInstance.get('/conversations'),
  getOrCreateConversation: (payload) => axiosInstance.post('/conversations', payload),
  getMessages: (conversationId, params) => axiosInstance.get(`/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, content) => axiosInstance.post(`/conversations/${conversationId}/messages`, { content }),
};
