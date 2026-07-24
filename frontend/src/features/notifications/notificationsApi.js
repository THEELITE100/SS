import axiosInstance from '../../api/axiosInstance';

export const notificationsApi = {
  list: (params) => axiosInstance.get('/notifications', { params }),
  markRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosInstance.patch('/notifications/read-all'),
};
