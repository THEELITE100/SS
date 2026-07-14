import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';
import CreateGigModal from '../components/specific/CreateGigModal';

const ExploreGigsPage = () => {
  const navigate = useNavigate();
  
  const storedUser = localStorage.getItem('userInfo');
  const user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;

  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [selectedGig, setSelectedGig] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGigs = async () => {
    try {
      const res = await apiClient.get('/gigs');
      setGigs(res.data || []);
    } catch (err) {
      console.error('Data query failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const enforceAuth = (actionCallback) => {
    if (!user) {
      alert('Secure Access Required: Please create an account or log in to perform this action.');
      navigate('/register');
      return;
    }
    actionCallback();
  };

  const handleDelete = async (gigId) => {
    if (window.confirm("Are you sure you want to permanently delete this project?")) {
      try {
        await apiClient.delete(`/gigs/${gigId}`);
        setGigs(gigs.filter(g => g._id !== gigId));
      } catch (err) {
        alert('Failed to delete project.');
      }
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/proposals', {
        gigId: selectedGig._id,
        bidAmount: Number(bidAmount),
        coverLetter
      });
      alert('Proposal securely submitted to the client!');
      setSelectedGig(null);
      setBidAmount('');
      setCoverLetter('');
    } catch (err) {
      alert('Failed to submit proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGigs = gigs.filter(gig => {
    let matchesCategory = categoryFilter === 'All' || gig.category === categoryFilter;
    let matchesBudget = true;
    if (budgetFilter === 'Low') matchesBudget = gig.maxBudget < 10000;
    if (budgetFilter === 'Medium') matchesBudget = gig.maxBudget >= 10000 && gig.maxBudget <= 50000;
    if (budgetFilter === 'High') matchesBudget = gig.maxBudget > 50000;
    return matchesCategory && matchesBudget;
  });

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="sticky top-24 space-y-6">
            <GlassCard className="!p-6 shadow-lg">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-premium-dark block mb-2">Category</label>
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-200 outline-none">
                    <option value="All">All Categories</option>
                    <option value="Web Development">Web Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="AI & Machine Learning">AI & ML</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-premium-dark block mb-2">Budget Range</label>
                  <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-200 outline-none">
                    <option value="All">All Budgets</option>
                    <option value="Low">Under ₹10,000</option>
                    <option value="Medium">₹10,000 - ₹50,000</option>
                    <option value="High">Above ₹50,000</option>
                  </select>
                </div>
              </div>
            </GlassCard>

            <Button 
              variant="primary" 
              className="w-full shadow-xl"
              onClick={() => enforceAuth(() => setIsModalOpen(true))}
            >
              + Post New Project
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-3xl font-black text-premium-dark">Gig Marketplace</h1>
              <p className="text-sm text-gray-500 mt-1">Discover hyperlocal opportunities.</p>
            </div>
            {!user && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Viewing as Guest</span>}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-400 uppercase tracking-widest">Loading secure ledger...</div>
          ) : filteredGigs.length === 0 ? (
            <GlassCard className="!p-12 text-center text-gray-500 font-medium">No projects match your filters.</GlassCard>
          ) : (
            filteredGigs.map((gig) => (
              <GlassCard key={gig._id} className="!p-6 shadow-sm hover:shadow-xl transition-all group relative">
                
                {user && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => handleDelete(gig._id)}
                      className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100"
                    >
                      Delete
                    </button>
                  </div>
                )}

                <h3 className="text-lg font-black text-premium-dark w-11/12">{gig.title}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-1 block">{gig.category}</span>
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{gig.description}</p>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="text-sm font-black text-premium-dark">
                    ₹{gig.maxBudget?.toLocaleString()} <span className="text-xs font-normal text-gray-400">Max</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => enforceAuth(() => setSelectedGig(gig))}
                  >
                    Submit Proposal
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <CreateGigModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchGigs} 
      />
      {selectedGig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-lg !p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedGig(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-black text-premium-dark mb-1">Submit Proposal</h2>
            <p className="text-xs text-gray-500 mb-6">Bidding on: <span className="font-bold text-black">{selectedGig.title}</span></p>
            
            <form onSubmit={handleSubmitProposal} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-premium-dark block mb-2">Your Bid (INR)</label>
                <input 
                  type="number" 
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Max Budget: ₹${selectedGig.maxBudget}`}
                  className="w-full text-sm p-3 rounded-lg border border-gray-200 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-premium-dark block mb-2">Cover Letter</label>
                <textarea 
                  required
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you the perfect fit for this project?"
                  className="w-full text-sm p-3 rounded-lg border border-gray-200 outline-none"
                />
              </div>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Transmitting...' : 'Send Secure Proposal'}
              </Button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default ExploreGigsPage;