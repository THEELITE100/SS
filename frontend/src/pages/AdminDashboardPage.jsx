import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import GlassCard from '../components/common/GlassCard';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const storedUser = sessionStorage.getItem('userInfo');
  const user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGigs: 0,
    activeDisputes: 0,
    platformRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchAdminStats = async () => {
      try {
        const res = await apiClient.get('/admin/stats').catch(() => ({ data: null }));
        if (res.data) setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch admin ledger.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminStats();
  }, [user]);

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "DANGER: Are you sure you want to delete your Super Admin account? This will permanently revoke your access to the platform."
    );

    if (isConfirmed) {
      try {
        await apiClient.delete(`/auth/delete-account/${user._id}`);
        sessionStorage.clear();
        alert("Super Admin account permanently erased.");
        navigate('/'); 
      } catch (err) {
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] bg-red-50/50">
        <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
          Access Denied. Administrator clearance required.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-premium-dark tracking-tight">Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Live platform telemetry and moderation controls.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Loading Live Metrics...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="!p-6 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Network</span>
              <span className="text-4xl font-black text-premium-dark mt-4">{stats.totalUsers}</span>
            </GlassCard>
            
            <GlassCard className="!p-6 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Gigs</span>
              <span className="text-4xl font-black text-premium-dark mt-4">{stats.totalGigs}</span>
            </GlassCard>

            <GlassCard className="!p-6 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Open Disputes</span>
              <span className="text-4xl font-black text-red-600 mt-4">{stats.activeDisputes}</span>
            </GlassCard>

            <GlassCard className="!p-6 flex flex-col justify-between bg-gradient-to-br from-gray-900 to-black border-none">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Escrow Volume (INR)</span>
              <span className="text-4xl font-black text-white mt-4">₹{stats.platformRevenue.toLocaleString()}</span>
            </GlassCard>
          </div>
        )}
        <div className="mt-16 pt-8 border-t border-red-100">
            <h2 className="text-lg font-black text-red-600 mb-2">Danger Zone</h2>
            <GlassCard className="!p-6 border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-premium-dark">Resign & Delete Admin Account</h3>
                <p className="text-xs text-gray-500 mt-1">This will permanently delete your admin credentials. You will lose all system access instantly.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex-shrink-0"
              >
                Delete Admin Account
              </button>
            </GlassCard>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;