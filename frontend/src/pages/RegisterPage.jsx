import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'client' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/register', formData);
      setIsLoading(false);
      localStorage.setItem('token', res.data.token || 'mock_jwt_token');
      localStorage.setItem('userInfo', JSON.stringify(res.data.user || formData));
      alert('Account created successfully!');
      navigate('/gigs');
      window.location.reload();
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md !p-8 border-gray-200/80 shadow-2xl flex flex-col gap-6 animate-fade-in">
        
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">Join Ecosystem</span>
          <h1 className="text-2xl font-black text-premium-dark mt-1">Create Account</h1>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="name" label="Full Name" placeholder="Alex Rivera" value={formData.name} onChange={handleChange} required />
          <Input id="email" label="Email Address" type="email" placeholder="alex@skillsphere.io" value={formData.email} onChange={handleChange} required />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">Primary Role</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {['client', 'freelancer'].map((roleType) => (
                <label
                  key={roleType}
                  onClick={() => setFormData((prev) => ({ ...prev, role: roleType }))}
                  className={`p-3 rounded-xl border text-center font-bold text-xs uppercase cursor-pointer select-none transition-all ${
                    formData.role === roleType ? 'bg-black text-white border-black shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {roleType === 'client' ? '🏢 Hire Talent' : '💻 Work as Talent'}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth disabled={isLoading} className="mt-2">
            {isLoading ? 'Creating Account...' : 'Get Started'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-black hover:underline">Sign In</Link>
        </p>

      </GlassCard>
    </div>
  );
};

export default RegisterPage;