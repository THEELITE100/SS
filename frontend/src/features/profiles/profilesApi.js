import axiosInstance from '../../api/axiosInstance';

export const profilesApi = {
  getMine: () => axiosInstance.get('/profiles/me'),
  updateMine: (payload) => axiosInstance.patch('/profiles/me', payload),
  myAnalytics: () => axiosInstance.get('/profiles/me/analytics'),
  getFreelancer: (userId) => axiosInstance.get(`/profiles/freelancer/${userId}`),
  getClient: (userId) => axiosInstance.get(`/profiles/client/${userId}`),
};
