import axiosInstance from '../../api/axiosInstance';

export const paymentsApi = {
  fundMilestone: (gigId, milestoneId) => axiosInstance.post(`/gigs/${gigId}/milestones/${milestoneId}/payment`),
  confirmPayment: (paymentId) => axiosInstance.post(`/payments/${paymentId}/confirm`),
  listForGig: (gigId) => axiosInstance.get(`/gigs/${gigId}/payments`),
  connectOnboard: () => axiosInstance.post('/payments/connect/onboard'),
  connectStatus: () => axiosInstance.get('/payments/connect/status'),
};
