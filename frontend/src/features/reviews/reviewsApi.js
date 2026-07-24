import axiosInstance from '../../api/axiosInstance';

export const reviewsApi = {
  create: (gigId, payload) => axiosInstance.post(`/gigs/${gigId}/reviews`, payload),
  forUser: (userId, params) => axiosInstance.get(`/reviews/user/${userId}`, { params }),
  analyticsForUser: (userId) => axiosInstance.get(`/reviews/user/${userId}/analytics`),
};
