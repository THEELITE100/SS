import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../../utils/apiClient';
import Input from '../common/Input';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';

const NegotiationModal = ({ isOpen, onClose, gig, onSuccess }) => {
  if (!isOpen || !gig) return null;

  const [formData, setFormData] = useState({
    coverLetter: '',
    bidAmount: gig.budgetRange?.max || 50000,
    estimatedDays: 14,
  });

  const [milestones, setMilestones] = useState([
    { title: 'Initial Architecture & Setup', amount: Math.round((gig.budgetRange?.max || 50000) * 0.4) },
    { title: 'Final Delivery & Deployment', amount: Math.round((gig.budgetRange?.max || 50000) * 0.6) },
  ]);

  const [error, setError] = useState(null);

  const proposalMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post(`/gigs/${gig._id}/proposals`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to submit proposal.');
    },
  });

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: 'New Milestone', amount: 0 }]);
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = field === 'amount' ? Number(value) : value;
    setMilestones(updated);
  };

  const handleRemoveMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (totalMilestoneAmount !== Number(formData.bidAmount)) {
      setError(`Milestone total (₹${totalMilestoneAmount.toLocaleString('en-IN')}) must exactly match your Total Bid Amount (₹${Number(formData.bidAmount).toLocaleString('en-IN')}).`);
      return;
    }

    proposalMutation.mutate({
      coverLetter: formData.coverLetter,
      bidAmount: Number(formData.bidAmount),
      estimatedDays: Number(formData.estimatedDays),
      proposedMilestones: milestones,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto !p-6 shadow-2xl border-white/20 bg-white">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-premium-accent">
              Submit Proposal
            </span>
            <h3 className="text-xl font-extrabold text-premium-dark tracking-tight">
              {gig.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
              Cover Letter & Strategy Pitch <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="4"
              required
              placeholder="Outline why your skills match this project and how you plan to execute the deliverables..."
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              className="w-full p-4 rounded-xl border border-gray-200 text-sm text-premium-dark focus:border-premium-dark focus:ring-2 focus:ring-black/5 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="bidAmount"
              label="Total Bid Amount (₹)"
              type="number"
              required
              value={formData.bidAmount}
              onChange={(e) => setFormData({ ...formData, bidAmount: e.target.value })}
            />
            <Input
              id="estimatedDays"
              label="Estimated Turnaround (Days)"
              type="number"
              required
              value={formData.estimatedDays}
              onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-premium-muted block">
                  Milestone Schedule
                </span>
                <span className="text-[11px] text-gray-400">
                  Split your total bid into verifiable deliverables
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="text-xs font-bold text-premium-accent hover:underline flex items-center gap-1"
              >
                + Add Milestone
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200/60">
                  <input
                    type="text"
                    placeholder="Milestone Title"
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    className="flex-1 bg-transparent text-xs font-medium text-premium-dark px-2 py-1 border-b border-gray-200 focus:border-premium-dark outline-none"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={m.amount}
                      onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                      className="w-24 bg-white text-xs font-bold text-premium-dark px-2 py-1 rounded border border-gray-200 outline-none text-right"
                    />
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-gray-400 hover:text-red-500 px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold border transition-colors ${
              totalMilestoneAmount === Number(formData.bidAmount)
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <span>Milestones Allocation Total:</span>
              <span>₹{totalMilestoneAmount.toLocaleString('en-IN')} / ₹{Number(formData.bidAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={proposalMutation.isPending}
            >
              {proposalMutation.isPending ? 'Submitting...' : 'Send Proposal'}
            </Button>
          </div>

        </form>
      </GlassCard>
    </div>
  );
};

export default NegotiationModal;