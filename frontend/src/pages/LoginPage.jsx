import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import GlassCard from '../components/common/GlassCard';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', formData);
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('userInfo', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'admin') navigate('/admin-dashboard');
      else if (res.data.user.role === 'freelancer') navigate('/dashboard');
      else navigate('/explore');
      
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresOTP) {
        alert("Account pending verification. Please verify the OTP sent to your email.");
      } else {
        alert(err.response?.data?.message || 'Login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/auth/forgot-password', { email: resetData.email });
      alert('OTP sent to your email! (Check backend terminal if no email setup)');
      setForgotStep(2);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request reset.');
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/auth/reset-password', resetData);
      alert('Password successfully reset! You can now log in.');
      setIsForgotOpen(false);
      setForgotStep(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light flex items-center justify-center p-4">
      
      <GlassCard className="w-full max-w-md !p-8 shadow-2xl">
        <h1 className="text-2xl font-black text-premium-dark text-center mb-1">Welcome Back</h1>
        <p className="text-xs text-gray-500 text-center mb-8">Sign in to your secure workspace.</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input label="Email Address" type="email" name="email" required onChange={handleChange} />
          
          <div>
            <Input label="Password" type="password" name="password" required onChange={handleChange} />
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                onClick={() => setIsForgotOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" className="mt-2" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </form>
      </GlassCard>

      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-md !p-8 shadow-2xl relative">
            
            <button onClick={() => { setIsForgotOpen(false); setForgotStep(1); }} className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold">✕</button>
            <h2 className="text-xl font-black text-premium-dark mb-1">Reset Password</h2>
            
            {forgotStep === 1 ? (
              <>
                <p className="text-xs text-gray-500 mb-6">Enter your email to receive a secure recovery code.</p>
                <form onSubmit={handleRequestReset} className="flex flex-col gap-4">
                  <Input label="Email Address" type="email" name="email" required value={resetData.email} onChange={handleResetChange} />
                  <Button type="submit" variant="primary">Send Recovery Code</Button>
                </form>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-6">Enter the 6-digit code sent to <span className="font-bold text-black">{resetData.email}</span></p>
                <form onSubmit={handleConfirmReset} className="flex flex-col gap-4">
                  <Input label="6-Digit OTP" type="text" name="otp" required value={resetData.otp} onChange={handleResetChange} />
                  <Input label="New Secure Password" type="password" name="newPassword" required value={resetData.newPassword} onChange={handleResetChange} />
                  <Button type="submit" variant="primary">Confirm New Password</Button>
                </form>
              </>
            )}

          </GlassCard>
        </div>
      )}

    </div>
  );
};

export default LoginPage;