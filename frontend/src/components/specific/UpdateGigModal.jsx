import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import Input from '../common/Input';
import Button from '../common/Button';

const UpdateGigModal = ({ isOpen, onClose, gig, onUpdateSuccess }) => {
  if (!isOpen || !gig) return null;

  const [title, setTitle] = useState(gig.title || '');
  const [description, setDescription] = useState(gig.description || '');
  const [maxBudget, setMaxBudget] = useState(gig.maxBudget || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const res = await apiClient.put(`/gigs/${gig._id}`, {
        title,
        description,
        maxBudget: Number(maxBudget)
      });
      setIsProcessing(false);
      onUpdateSuccess(res.data.gig || { ...gig, title, description, maxBudget: Number(maxBudget) });
      onClose();
    } catch (err) {
      setIsProcessing(false);
      setError('Failed to update project configurations.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 flex flex-col gap-5">
        
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Project Management</span>
          <h2 className="text-xl font-extrabold text-premium-dark mt-0.5">Edit Project Scope</h2>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200">{error}</div>}

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <Input id="title" label="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Project Scope & Details</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 text-xs outline-none focus:border-black transition-all"
              required
            />
          </div>

          <Input id="maxBudget" label="Maximum Allocation (INR)" type="number" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} required />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isProcessing}>
              {isProcessing ? 'Updating Ledger...' : 'Save Configurations'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateGigModal;