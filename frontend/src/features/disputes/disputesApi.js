import axiosInstance from '../../api/axiosInstance';

export const disputesApi = {
  create: (gigId, payload) => axiosInstance.post(`/gigs/${gigId}/disputes`, payload),
  mine: () => axiosInstance.get('/disputes/mine'),
  getById: (id) => axiosInstance.get(`/disputes/${id}`),
  addMessage: (id, message) => axiosInstance.post(`/disputes/${id}/messages`, { message }),
};
