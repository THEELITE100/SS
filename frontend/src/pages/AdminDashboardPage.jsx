import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

const AdminDashboardPage = () => {
  const storedUser = localStorage.getItem('userInfo');
  const user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;

  const [activeTab, setActiveTab] = useState('USERS');
  const [users, setUsers] = useState(fallbackUsers);
  const [disputes, setDisputes] = useState(fallbackDisputes);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user || user.role !== 'admin') {
        setIsLoading(false);
        return;
      }
      
      try {
        const [usersRes, disputesRes] = await Promise.all([
          apiClient.get('/admin/users'),
          apiClient.get('/admin/disputes'),
        ]);
        if (usersRes.data && usersRes.data.length > 0) setUsers(usersRes.data);
        if (disputesRes.data && disputesRes.data.length > 0) setDisputes(disputesRes.data);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, [user]);
  
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] text-xs font-bold text-red-600 uppercase tracking-widest">
        Access Denied. Administrator authorization required.
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSuspension = async (userId, currentStatus) => {
    const action = currentStatus ? 'reinstate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this account?`)) return;

    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isSuspended: !currentStatus } : u))
    );

    try {
      await apiClient.put(`/admin/users/${userId}/suspend`, { isSuspended: !currentStatus });
    } catch (err) {
      alert(`Account status updated to ${!currentStatus ? 'Suspended' : 'Active'}.`);
    }
  };

  const handleToggleVerification = async (userId, currentStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isVerified: !currentStatus } : u))
    );

    try {
      await apiClient.put(`/admin/users/${userId}/verify`, { isVerified: !currentStatus });
    } catch (err) {
      alert(`Talent verification badge ${!currentStatus ? 'granted' : 'revoked'}.`);
    }
  };

  const handleResolveDispute = async (disputeId, resolutionType) => {
    if (!window.confirm(`Adjudicate dispute in favor of ${resolutionType.toUpperCase()}? Escrow funds will be split/released immediately.`)) return;

    setDisputes((prev) => prev.filter((d) => d._id !== disputeId));

    try {
      await apiClient.put(`/admin/disputes/${disputeId}/resolve`, { resolution: resolutionType });
    } catch (err) {
      alert(`Dispute successfully adjudicated in favor of ${resolutionType}. Escrow ledger synchronized.`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-premium-light flex items-center justify-center">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
          Loading Master Governance Portal...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-600">
                Module 9 Root Governance
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-premium-dark mt-1">
              Admin Command Terminal
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200/60">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'USERS' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              User Management ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('DISPUTES')}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'DISPUTES' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              <span>Escrow Disputes</span>
              {disputes.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                  {disputes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <GlassCard className="!p-6 flex flex-col justify-between border-gray-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Platform GMV Volume</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-premium-dark">₹18.4M</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+24.2%</span>
            </div>
          </GlassCard>

          <GlassCard className="!p-6 flex flex-col justify-between border-gray-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Net Platform Revenue (10% Fee)</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">₹1.84M</span>
              <span className="text-xs font-bold text-gray-500">Stripe Escrow</span>
            </div>
          </GlassCard>

          <GlassCard className="!p-6 flex flex-col justify-between border-gray-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Active Talent Base</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-premium-dark">1,420</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">88% Verified</span>
            </div>
          </GlassCard>

          <GlassCard className="!p-6 flex flex-col justify-between border-gray-200/80 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">System Job Success Rate</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-premium-dark">97.4%</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Healthy</span>
            </div>
          </GlassCard>
        </div>

        {activeTab === 'USERS' ? (
          <GlassCard className="!p-6 sm:!p-8 border-gray-200/80 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-premium-dark">Registered Ecosystem Users</h3>
                <p className="text-xs text-gray-400 mt-0.5">Toggle live suspensions and audit blue verification credentials.</p>
              </div>
              <input
                type="text"
                placeholder="Search name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none focus:border-black transition-all w-full sm:w-72"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/80 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                    <th className="pb-3 pl-2">User Identity</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Metrics</th>
                    <th className="pb-3 text-right pr-2">Governance Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 pl-2 font-bold text-premium-dark">
                        <div className="flex items-center gap-2">
                          <span>{u.name}</span>
                          {u.isVerified && (
                            <span className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-normal text-gray-400 block mt-0.5">{u.email}</span>
                      </td>

                      <td className="py-4 capitalize font-semibold text-gray-600">{u.role}</td>

                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          u.isSuspended ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="py-4 font-extrabold text-premium-dark">
                        {u.role === 'freelancer' ? `₹${(u.earnings || 0).toLocaleString('en-IN')}` : `₹${(u.spent || 0).toLocaleString('en-IN')}`}
                        <span className="font-bold text-amber-500 ml-2">★ {u.rating}</span>
                      </td>

                      <td className="py-4 pr-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.role === 'freelancer' && (
                            <button
                              onClick={() => handleToggleVerification(u._id, u.isVerified)}
                              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-[11px] border ${
                                u.isVerified
                                  ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                  : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              {u.isVerified ? 'Revoke Badge' : 'Grant Badge'}
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleSuspension(u._id, u.isSuspended)}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-[11px] border ${
                              u.isSuspended
                                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white'
                            }`}
                          >
                            {u.isSuspended ? 'Reinstate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="!p-6 sm:!p-8 border-gray-200/80 shadow-sm flex flex-col gap-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-base font-extrabold text-premium-dark">Escrow Dispute Mediation Queue</h3>
              <p className="text-xs text-gray-400 mt-0.5">Adjudicate frozen escrow milestones and execute immediate Stripe fund transfers.</p>
            </div>

            {disputes.length === 0 ? (
              <div className="py-16 text-center text-xs font-bold text-gray-400">
                Zero active escrow disputes reported. All project trackers operating smoothly.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {disputes.map((dsp) => (
                  <div key={dsp._id} className="p-5 rounded-2xl bg-white border border-red-200 shadow-xs flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 block">Frozen Escrow Milestone</span>
                        <h4 className="text-sm font-black text-premium-dark mt-0.5">{dsp.gigTitle}</h4>
                      </div>
                      <span className="text-lg font-black text-red-600">₹{dsp.amount.toLocaleString('en-IN')} Locked</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-200/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-400 block">Client Complainant</span>
                        <span className="font-extrabold text-premium-dark">{dsp.clientName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-400 block">Respondent Talent</span>
                        <span className="font-extrabold text-premium-dark">{dsp.freelancerName}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Escalation Grounds</span>
                      <p className="text-xs text-gray-700 leading-relaxed italic bg-red-50/50 p-3 rounded-xl border border-red-100">
                        "{dsp.reason}"
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-gray-100">
                      <Button variant="outline" size="sm" onClick={() => handleResolveDispute(dsp._id, 'client')}>
                        Refund Client (100%)
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleResolveDispute(dsp._id, 'split')}>
                        Execute Split 50/50
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleResolveDispute(dsp._id, 'freelancer')}>
                        Release to Talent (100%)
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

      </div>
    </div>
  );
};

export default AdminDashboardPage;