import axiosInstance from '../../api/axiosInstance';

export const proposalsApi = {
  create: (gigId, payload) => axiosInstance.post(`/gigs/${gigId}/proposals`, payload),
  listForGig: (gigId) => axiosInstance.get(`/gigs/${gigId}/proposals`),
  mine: () => axiosInstance.get('/proposals/mine'),
  accept: (id) => axiosInstance.patch(`/proposals/${id}/accept`),
  reject: (id) => axiosInstance.patch(`/proposals/${id}/reject`),
  withdraw: (id) => axiosInstance.patch(`/proposals/${id}/withdraw`),
  negotiate: (id, payload) => axiosInstance.post(`/proposals/${id}/negotiate`, payload),
};
