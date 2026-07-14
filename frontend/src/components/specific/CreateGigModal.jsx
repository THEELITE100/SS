import React, { useState } from 'react';
import apiClient from '../../utils/apiClient';
import Input from '../common/Input';
import Button from '../common/Button';

const CreateGigModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [maxBudget, setMaxBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/gigs', {
        title,
        description,
        category,
        maxBudget: Number(maxBudget)
      });
      setIsLoading(false);
      
      setTitle('');
      setDescription('');
      setMaxBudget('');
      
      onSuccess();
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError('Failed to post project. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 flex flex-col gap-5">
        
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">New Opportunity</span>
            <h2 className="text-xl font-extrabold text-premium-dark mt-0.5">Post a Project</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-bold">✕</button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="title" label="Project Title" placeholder="e.g., Full-Stack React Developer Needed" value={title} onChange={(e) => setTitle(e.target.value)} required />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Project Scope & Details</label>
            <textarea
              rows={4}
              placeholder="Describe the exact requirements, timeline, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 text-xs outline-none focus:border-black transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-black bg-white transition-all"
            >
              <option value="Web Development">Web Development</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Mobile Apps">Mobile Apps</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
            </select>
          </div>

          <Input id="maxBudget" label="Maximum Allocation (INR)" type="number" placeholder="75000" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} required />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
              {isLoading ? 'Encrypting Ledger...' : 'Publish to Marketplace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGigModal;