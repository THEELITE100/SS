// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import apiClient from '../utils/apiClient';
// import GlassCard from '../components/common/GlassCard';
// import Button from '../components/common/Button';

// const emptyAnalytics = {
//   kpis: { totalEarnings: 0, activeProjects: 0, profileViews: 0, jobSuccessRate: 0, reputationScore: 0 },
//   monthlyRevenue: [],
//   activeApplications: [],
//   recentReviews: [],
// };

// const FreelancerDashboardPage = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState(emptyAnalytics);
//   const [isLoading, setIsLoading] = useState(true);
  

//   const storedUser = localStorage.getItem('userInfo');
//   const user = storedUser ? JSON.parse(storedUser) : { name: 'Verified Specialist', email: 'talent@skillsphere.io' };

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       if (!user) return;
//       try {
//         const res = await apiClient.get(`/analytics/freelancer/${user._id}`);
//         setData(res.data || emptyAnalytics);
//       } catch (err) {
//         console.error('Failed to load analytics');
//         setData(emptyAnalytics);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchAnalytics();
//   }, [user]);

//   if (!user || user.role !== 'freelancer') {
//     return (
//       <div className="flex items-center justify-center min-h-[calc(100vh-72px)] text-xs font-bold text-red-600">
//         Access Denied. Freelancer authorization required.
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-[calc(100vh-72px)] bg-premium-light flex items-center justify-center">
//         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
//           Compiling Executive Analytics...
//         </span>
//       </div>
//     );
//   }

//   const maxRevenue = Math.max(...data.monthlyRevenue.map((m) => m.amount), 80000);

//   return (
//     <div className="min-h-[calc(100vh-72px)] bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in">
        
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
//               <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
//                 Module 15 Executive Terminal
//               </span>
//             </div>
//             <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-premium-dark mt-1">
//               Welcome, {user.name || 'Specialist'}
//             </h1>
//           </div>

//           <div className="flex items-center gap-3">
//             <Button variant="outline" size="sm" onClick={() => navigate('/freelancer/edit-profile')}>
//               Edit Profile & Rates
//             </Button>
//             <Button variant="primary" size="sm" onClick={() => navigate('/gigs')}>
//               Browse Live Gigs ↗
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//           <GlassCard className="!p-6 flex flex-col justify-between border-gray-200/80 shadow-xs">
//             <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Escrow Earnings</span>
//             <div className="mt-2 flex items-baseline justify-between">
//               <span className="text-2xl sm:text-3xl font-black text-premium-dark">
//                 ₹{data.kpis.totalEarnings.toLocaleString('en-IN')}
//               </span>
//               <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+18.4%</span>
//             </div>
//           </GlassCard>

//           <GlassCard className="!p-6 flex flex-col justify-between border-gray-200/80 shadow-xs">
//             <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Profile & Portfolio Views</span>
//             <div className="mt-2 flex items-baseline justify-between">
//               <span className="text-2xl sm:text-3xl font-black text-premium-dark">
//                 {data.kpis.profileViews.toLocaleString()}
//               </span>
//               <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">AI Recommended</span>
//             </div>
//           </GlassCard>

//           <GlassCard className="!p-6 flex flex-col justify-between border-gray-200/80 shadow-xs">
//             <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Job Success Score</span>
//             <div className="mt-2 flex items-baseline justify-between">
//               <span className="text-2xl sm:text-3xl font-black text-emerald-600">
//                 {data.kpis.jobSuccessRate}%
//               </span>
//               <span className="text-xs font-bold text-gray-500">Tier 1 Talent</span>
//             </div>
//           </GlassCard>

//           <GlassCard className="!p-6 flex flex-col justify-between border-gray-200/80 shadow-xs">
//             <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Weighted Reputation</span>
//             <div className="mt-2 flex items-baseline justify-between">
//               <span className="text-2xl sm:text-3xl font-black text-amber-500">
//                 ★ {data.kpis.reputationScore}
//               </span>
//               <span className="text-xs font-bold text-gray-400">Verified Reviews</span>
//             </div>
//           </GlassCard>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
//           <GlassCard className="lg:col-span-2 !p-6 sm:!p-8 border-gray-200/80 shadow-sm flex flex-col gap-6">
//             <div className="flex items-center justify-between border-b border-gray-100 pb-4">
//               <div>
//                 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Financial Analytics</span>
//                 <h3 className="text-base font-extrabold text-premium-dark">Monthly Revenue Trajectory (₹ INR)</h3>
//               </div>
//               <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
//                 H1 Performance
//               </span>
//             </div>

//             <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-2 px-2 border-b border-gray-200/60">
//               {data.monthlyRevenue.map((item, idx) => {
//                 const heightPercentage = Math.round((item.amount / maxRevenue) * 100);
//                 return (
//                   <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
//                     <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-extrabold text-black bg-white px-1.5 py-0.5 rounded shadow-xs border">
//                       ₹{(item.amount / 1000).toFixed(0)}k
//                     </span>
//                     <div
//                       style={{ height: `${heightPercentage}%` }}
//                       className="w-full max-w-[48px] bg-black hover:bg-blue-600 rounded-t-xl transition-all duration-300 shadow-xs"
//                     />
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="flex items-center justify-between px-2 text-xs font-bold text-gray-400 uppercase">
//               {data.monthlyRevenue.map((item, idx) => (
//                 <span key={idx} className="flex-1 text-center">{item.month}</span>
//               ))}
//             </div>
//           </GlassCard>

//           <GlassCard className="lg:col-span-1 !p-6 sm:!p-8 border-gray-200/80 shadow-sm flex flex-col gap-5">
//             <div className="border-b border-gray-100 pb-4">
//               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Active Execution</span>
//               <h3 className="text-base font-extrabold text-premium-dark">Active Contracts & Bids</h3>
//             </div>

//             <div className="flex flex-col gap-4">
//               {data.activeApplications.map((app) => (
//                 <div key={app._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/60 flex flex-col gap-3">
//                   <div className="flex items-start justify-between gap-2">
//                     <div>
//                       <h4 className="text-xs font-bold text-premium-dark line-clamp-1">{app.title}</h4>
//                       <span className="text-[10px] font-semibold text-gray-500">{app.client}</span>
//                     </div>
//                     <span className="text-xs font-black text-premium-dark shrink-0">
//                       ₹{(app.bid / 1000).toFixed(0)}k
//                     </span>
//                   </div>

//                   <div className="flex flex-col gap-1">
//                     <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
//                       <span>Milestone Progress</span>
//                       <span>{app.progress}%</span>
//                     </div>
//                     <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
//                       <div style={{ width: `${app.progress}%` }} className="h-full bg-black rounded-full" />
//                     </div>
//                   </div>

//                   <Button
//                     variant="secondary"
//                     size="sm"
//                     fullWidth
//                     onClick={() => navigate(`/chat/${app._id}`)}
//                     className="!py-1.5 !text-xs mt-1"
//                   >
//                     Open Workspace ↗
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </GlassCard>

//         </div>

//         <GlassCard className="!p-6 sm:!p-8 border-gray-200/80 shadow-sm flex flex-col gap-6">
//           <div className="border-b border-gray-100 pb-4">
//             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Module 8 Reputation Audit</span>
//             <h3 className="text-base font-extrabold text-premium-dark">Verified Client Reviews & Feedback</h3>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {data.recentReviews.map((rev) => (
//               <div key={rev._id} className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex flex-col justify-between gap-4">
//                 <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
//                   "{rev.comment}"
//                 </p>
//                 <div className="flex items-center justify-between pt-3 border-t border-gray-100">
//                   <span className="text-xs font-bold text-premium-dark">{rev.clientName}</span>
//                   <span className="text-xs font-black text-amber-500">★ {rev.rating.toFixed(1)} Verified</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </GlassCard>

//       </div>
//     </div>
//   );
// };

// export default FreelancerDashboardPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

const FreelancerDashboardPage = () => {
  const navigate = useNavigate();
  const storedUser = sessionStorage.getItem('userInfo');
  const user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;

  const [data, setData] = useState({
    totalEarnings: 0,
    activeProjects: 0,
    pendingProposals: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'freelancer') return;

    const fetchDashboard = async () => {
      try {
        const res = await apiClient.get(`/analytics/freelancer/${user._id}`).catch(() => ({ data: null }));
        if (res.data) setData(res.data);
      } catch (err) {
        console.error('Failed to sync workspace.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "DANGER: Are you absolutely sure you want to delete your workspace? All your data, earnings history, and proposals will be lost forever. This CANNOT be undone."
    );

    if (isConfirmed) {
      try {
        await apiClient.delete(`/auth/delete-account/${user._id}`);
        sessionStorage.clear();
        alert("Your account has been permanently erased.");
        navigate('/'); 
      } catch (err) {
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  if (!user || user.role !== 'freelancer') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-72px)] bg-red-50/50">
        <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
          Access Denied. Freelancer workspace only.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-premium-dark tracking-tight">Workspace Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user.name}.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Syncing Ledger...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="!p-6 flex flex-col justify-between bg-gradient-to-br from-blue-600 to-indigo-600 border-none">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Total Earnings</span>
                <span className="text-4xl font-black text-white mt-4">₹{data.totalEarnings.toLocaleString()}</span>
              </GlassCard>
              
              <GlassCard className="!p-6 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Projects</span>
                <span className="text-4xl font-black text-premium-dark mt-4">{data.activeProjects}</span>
              </GlassCard>

              <GlassCard className="!p-6 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Pending Proposals</span>
                <span className="text-4xl font-black text-premium-dark mt-4">{data.pendingProposals}</span>
              </GlassCard>
            </div>

            <h2 className="text-lg font-black text-premium-dark mt-12 mb-4 border-b border-gray-200 pb-2">Recent Network Activity</h2>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No recent activity found in the database.</p>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.map((activity, idx) => (
                  <GlassCard key={idx} className="!p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-premium-dark">{activity.description}</span>
                    <span className="text-xs text-gray-400">{activity.date}</span>
                  </GlassCard>
                ))}
              </div>
            )}
            <div className="mt-16 pt-8 border-t border-red-100">
              <h2 className="text-lg font-black text-red-600 mb-2">Danger Zone</h2>
              <GlassCard className="!p-6 border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-premium-dark">Permanently Delete Account</h3>
                  <p className="text-xs text-gray-500 mt-1">This will instantly erase your profile, earnings data, and active proposals. There is no going back.</p>
                </div>
                <button 
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex-shrink-0"
                >
                  Delete My Account
                </button>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboardPage;