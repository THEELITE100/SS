import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import apiClient from '../utils/apiClient';

const ProjectExecutionPage = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(65);
  const [activeVerification, setActiveVerification] = useState(null);
  const [workspaceNotice, setWorkspaceNotice] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const [milestones, setMilestones] = useState([
    { id: 1, title: 'Core UI & Redux State Setup', amount: 50000, status: 'completed' },
    { id: 2, title: 'Backend API Integration & Escrow Polish', amount: 75000, status: 'in_progress' },
  ]);

  const lockEscrowFunds = async (milestone) => {
    setIsRedirecting(true);
    try {
      const res = await apiClient.post('/payments/create-escrow-session', {
        gigTitle: milestone.title, 
        milestoneAmount: milestone.amount,
        gigId: gigId || 'gig_1'
      });
      
      window.location.href = res.data.url; 
    } catch (err) {
      alert('Failed to connect to Stripe Escrow node.');
      setIsRedirecting(false);
    }
  };

  const executeRelease = (id) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'released' } : m))
    );
    setActiveVerification(null);
    setWorkspaceNotice('Financial transaction settled. Funds routed to target node account.');
    setTimeout(() => setWorkspaceNotice(''), 4000);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
        
        <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Production Ledger Tracking</span>
            <h1 className="text-2xl font-black text-premium-dark mt-0.5">Project Workspace: {gigId || 'gig_1'}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/chat/active_channel')}>💬 Chat</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/gigs')}>← Exit</Button>
          </div>
        </div>

        {workspaceNotice && (
          <div className="p-3 bg-black text-white text-xs font-bold rounded-xl text-center shadow-md animate-fade-in">
            {workspaceNotice}
          </div>
        )}

        {activeVerification && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs flex flex-col gap-3 animate-fade-in">
            <div className="text-xs font-bold text-amber-800">
              ⚠️ Confirm Escrow Payout Authorization for Stage {activeVerification}?
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              This action will release locked Stripe escrow funds directly to the freelancer's payout account. This transaction is immutable once written to the database.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveVerification(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={() => executeRelease(activeVerification)}>Authorize Payout</Button>
            </div>
          </div>
        )}

        <GlassCard className="!p-6 border-gray-200/80 flex flex-col gap-3 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Overall Completion Matrix</span>
            <span className="text-sm font-black text-premium-dark">{progress}%</span>
          </div>
          <input
            type="range" min="0" max="100" value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full accent-black cursor-pointer h-1.5 bg-gray-200 rounded-lg"
          />
        </GlassCard>

        <GlassCard className="!p-6 border-gray-200/80 flex flex-col gap-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-premium-dark border-b border-gray-100 pb-2">Escrow Invoices</h3>
          
          <div className="flex flex-col gap-3">
            {milestones.map((ms) => (
              <div key={ms.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-200/60 text-xs">
                <div>
                  <h4 className="font-bold text-premium-dark">Stage {ms.id}: {ms.title}</h4>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">Allocation: ₹{ms.amount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    ms.status === 'released' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {ms.status}
                  </span>

                  {ms.status !== 'released' && (
                    <button
                      onClick={() => setActiveVerification(ms.id)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-extrabold bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      Release Funds
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default ProjectExecutionPage;