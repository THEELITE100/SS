import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('REGISTER');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'freelancer' });
  const [otp, setOtp] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/register', formData);
      setUserId(res.data.userId);
      setStep('VERIFY');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/verify-email', { userId, otp });
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('userInfo', JSON.stringify(res.data.user));
      navigate('/gigs');
    } catch (err) {
      alert('Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md !p-8 shadow-2xl animate-fade-in">
        
        {step === 'REGISTER' ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-premium-dark">Create Account</h1>
              <p className="text-xs text-gray-500 mt-2">Join the hyperlocal ecosystem.</p>
            </div>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              <select 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none bg-white"
              >
                <option value="freelancer">I am a Freelancer</option>
                <option value="client">I am a Client</option>
              </select>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Dispatching Secure OTP...' : 'Create Account'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-premium-dark">Verify Identity</h1>
              <p className="text-xs text-gray-500 mt-2">We sent a 6-digit code to {formData.email}</p>
            </div>
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              <Input label="Secure OTP Code" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Authenticate Account'}
              </Button>
            </form>
          </>
        )}

      </GlassCard>
    </div>
  );
};

export default RegisterPage;