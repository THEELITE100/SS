import axiosInstance from '../../api/axiosInstance';

export const gigsApi = {
  list: (params) => axiosInstance.get('/gigs', { params }),
  getById: (id) => axiosInstance.get(`/gigs/${id}`),
  getMine: () => axiosInstance.get('/gigs/mine'),
  create: (payload) => axiosInstance.post('/gigs', payload),
  update: (id, payload) => axiosInstance.patch(`/gigs/${id}`, payload),
  cancel: (id) => axiosInstance.delete(`/gigs/${id}`),
  updateMilestone: (gigId, milestoneId, status) =>
    axiosInstance.patch(`/gigs/${gigId}/milestones/${milestoneId}`, { status }),
};
