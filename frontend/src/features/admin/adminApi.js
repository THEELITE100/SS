import axiosInstance from '../../api/axiosInstance';

export const adminApi = {
  analytics: () => axiosInstance.get('/admin/analytics'),
  logs: (params) => axiosInstance.get('/admin/logs', { params }),

  users: (params) => axiosInstance.get('/admin/users', { params }),
  suspendUser: (id, reason) => axiosInstance.patch(`/admin/users/${id}/suspend`, { reason }),
  unsuspendUser: (id) => axiosInstance.patch(`/admin/users/${id}/unsuspend`),
  verifyFreelancer: (id, badge) => axiosInstance.patch(`/admin/users/${id}/verify-freelancer`, { badge }),

  gigs: (params) => axiosInstance.get('/admin/gigs', { params }),
  removeGig: (id, reason) => axiosInstance.patch(`/admin/gigs/${id}/remove`, { reason }),

  flaggedReviews: (params) => axiosInstance.get('/admin/reviews/flagged', { params }),
  resolveReview: (id, action) => axiosInstance.patch(`/admin/reviews/${id}/resolve`, { action }),

  disputes: (params) => axiosInstance.get('/admin/disputes', { params }),
  resolveDispute: (id, resolution, outcome) => axiosInstance.patch(`/admin/disputes/${id}/resolve`, { resolution, outcome }),
};
