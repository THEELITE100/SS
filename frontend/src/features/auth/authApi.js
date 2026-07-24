import axiosInstance from '../../api/axiosInstance';

export const authApi = {
  register: (payload) => axiosInstance.post('/auth/register', payload),
  login: (payload) => axiosInstance.post('/auth/login', payload),
  verifyLogin2FA: (payload) => axiosInstance.post('/auth/login/2fa', payload),
  logout: () => axiosInstance.post('/auth/logout'),
  refresh: () => axiosInstance.post('/auth/refresh'),
  getMe: () => axiosInstance.get('/auth/me'),
  verifyEmail: (token) => axiosInstance.get(`/auth/verify-email/${token}`),
  resendVerification: () => axiosInstance.post('/auth/resend-verification'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => axiosInstance.post('/auth/reset-password', payload),
  setup2FA: () => axiosInstance.post('/auth/2fa/setup'),
  verify2FASetup: (code) => axiosInstance.post('/auth/2fa/verify-setup', { code }),
  disable2FA: (password) => axiosInstance.post('/auth/2fa/disable', { password }),
};
