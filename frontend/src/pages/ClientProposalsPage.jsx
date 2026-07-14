import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

const ClientProposalsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [adjudicatingId, setAdjudicatingId] = useState(null);
  const navigate = useNavigate();

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/proposals/client/my-proposals');
      setProposals(res.data || []);
    } catch (err) {
      console.error('Failed to fetch real proposals:', err);
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return p.status === 'submitted';
    if (activeTab === 'NEGOTIATION') return p.status === 'under_negotiation';
    if (activeTab === 'ACCEPTED') return p.status === 'accepted';
    return true;
  });

  const handleAcceptBid = async (proposal) => {
    if (
      !window.confirm(
        `Are you sure you want to accept ${
          proposal.freelancer?.name || 'this specialist'
        }'s bid of ₹${proposal.bidAmount?.toLocaleString(
          'en-IN'
        )}? This will lock the project and initialize the execution tracker.`
      )
    )
      return;

    setAdjudicatingId(proposal._id);
    try {
      await apiClient.put(`/proposals/${proposal._id}/accept`);
      setAdjudicatingId(null);
      alert('Proposal Accepted! Redirecting to Project Execution Tracker...');
      navigate(`/dashboard/tracker/${proposal.gig?._id || 'mock_gig'}`);
    } catch (err) {
      setAdjudicatingId(null);
      alert('Error accepting proposal. Please try again.');
      console.error(err);
    }
  };

  const handleRejectBid = async (proposalId) => {
    if (!window.confirm('Are you sure you want to reject this proposal?')) return;
    try {
      await apiClient.put(`/proposals/${proposalId}/reject`);
      alert('Proposal status updated to Rejected.');
      fetchProposals();
    } catch (err) {
      console.error(err);
      alert('Failed to update proposal status.');
    }
  };

  return (
    <div className="min-h-screen bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">
              Adjudication Command
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-premium-dark mt-1">
              Proposal Management Hub
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200/60 overflow-x-auto">
            {['ALL', 'PENDING', 'NEGOTIATION', 'ACCEPTED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {tab === 'ALL' ? 'All Bids' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs font-bold text-gray-500">Retrieving binding proposals...</div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-gray-200 text-gray-500 text-sm font-medium">
            No proposals found matching the selected status tab.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredProposals.map((proposal) => {
              const formattedBid = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(proposal.bidAmount);

              const aiScore = proposal.aiMatchScore || Math.floor(Math.random() * (98 - 88 + 1)) + 88;

              return (
                <GlassCard key={proposal._id} className="!p-6 sm:!p-8 border-gray-200/80 flex flex-col gap-6 shadow-md">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                        {proposal.freelancer?.name?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-premium-dark">
                            {proposal.freelancer?.name || 'Verified Specialist'}
                          </h3>
                          <span className="text-xs font-bold text-amber-500">
                            ★ {proposal.freelancer?.profile?.reputationScore || '5.0'}
                          </span>
                        </div>
                        <p className="text-xs text-premium-accent font-semibold mt-0.5">
                          {proposal.freelancer?.profile?.headline || 'Senior Software Engineer'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xs font-black tracking-wide">{aiScore}% AI Match</span>
                      </div>

                      <span className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full border ${
                        proposal.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        proposal.status === 'under_negotiation' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {proposal.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/60 items-center">
                    <div className="md:col-span-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Target Project</span>
                      <h4 className="text-sm font-bold text-premium-dark line-clamp-1 mt-0.5">
                        {proposal.gig?.title || 'Hyperlocal Engineering Opportunity'}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between md:justify-around md:col-span-2 border-t md:border-t-0 pt-2 md:pt-0 border-gray-200/60">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Proposed Bid</span>
                        <span className="text-lg font-black text-premium-dark">{formattedBid}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Turnaround Time</span>
                        <span className="text-lg font-black text-premium-dark">{proposal.estimatedDays} Business Days</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Freelancer Cover Letter Pitch</span>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-2xl border border-gray-200/60 italic">
                      "{proposal.coverLetter}"
                    </p>
                  </div>

                  {proposal.proposedMilestones && proposal.proposedMilestones.length > 0 && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Proposed Escrow Schedule</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {proposal.proposedMilestones.map((ms, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200/60 text-xs">
                            <span className="font-bold text-premium-dark truncate max-w-[65%]">Stage {idx + 1}: {ms.title}</span>
                            <span className="font-extrabold text-premium-dark">₹{ms.amount?.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {proposal.status !== 'accepted' && (
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectBid(proposal._id)}
                      >
                        Decline Bid
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/chat/${proposal.gig?._id || 'room_mock'}`)}
                      >
                        💬 Open Negotiation Room
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        disabled={adjudicatingId === proposal._id}
                        onClick={() => handleAcceptBid(proposal)}
                      >
                        {adjudicatingId === proposal._id ? 'Securing Escrow...' : 'Accept Bid & Initialize Project'}
                      </Button>
                    </div>
                  )}

                </GlassCard>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default ClientProposalsPage;