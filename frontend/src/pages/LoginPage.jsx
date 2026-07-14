import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      setIsLoading(false);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      
      setStatusMessage({ type: 'success', text: 'Authentication successful. Redirecting to workspace...' });
      
      setTimeout(() => {
        navigate('/gigs');
        window.location.reload();
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      setStatusMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Access Denied. Check credentials and try again.' 
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md !p-8 border-gray-200/80 shadow-2xl flex flex-col gap-6 animate-fade-in">
        
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">Identity Verification</span>
          <h1 className="text-2xl font-black text-premium-dark mt-1">Sign In to SkillSphere</h1>
        </div>

        {statusMessage.text && (
          <div className={`p-4 rounded-xl text-xs font-bold text-center border transition-all ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Verified Email Address"
            type="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Account Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" variant="primary" size="md" fullWidth disabled={isLoading} className="mt-2">
            {isLoading ? 'Decrypting Secure Token...' : 'Authenticate Account'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 font-medium">
          New to the ecosystem?{' '}
          <Link to="/register" className="font-bold text-black hover:underline">
            Create Verified Account
          </Link>
        </p>

      </GlassCard>
    </div>
  );
};

export default LoginPage;