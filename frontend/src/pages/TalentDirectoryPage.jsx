import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

const TalentDirectoryPage = () => {
  const navigate = useNavigate();
  
  const storedUser = sessionStorage.getItem('userInfo');
  const user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;

  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [skillFilter, setSkillFilter] = useState('All');
  const [rateFilter, setRateFilter] = useState('All');

  const [selectedTalent, setSelectedTalent] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const res = await apiClient.get('/freelancers/explore').catch(() => ({ data: [] }));
        
        setFreelancers(res.data || []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTalent();
  }, []);

  const enforceAuth = (actionCallback) => {
    if (!user) {
      alert('Secure Access Required: Please create an account or log in to contact talent.');
      navigate('/register');
      return;
    }
    actionCallback();
  };

  const filteredTalent = freelancers.filter(f => {
    let matchesSkill = skillFilter === 'All' || f.skills.includes(skillFilter);
    let matchesRate = true;
    if (rateFilter === 'Low') matchesRate = f.hourlyRate < 1000;
    if (rateFilter === 'Medium') matchesRate = f.hourlyRate >= 1000 && f.hourlyRate <= 3000;
    if (rateFilter === 'High') matchesRate = f.hourlyRate > 3000;
    return matchesSkill && matchesRate;
  });

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/invitations', {
        talentId: selectedTalent._id,
        message: inviteMessage
      });
      alert(`Invitation successfully sent to ${selectedTalent.name}!`);
      setSelectedTalent(null);
      setInviteMessage('');
    } catch (err) {
      alert('Failed to send invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="sticky top-24 space-y-6">
            <GlassCard className="!p-6 shadow-lg">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">Talent Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-premium-dark block mb-2">Core Skill</label>
                  <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-200 outline-none">
                    <option value="All">All Skills</option>
                    <option value="React">React</option>
                    <option value="Node">Node.js</option>
                    <option value="Figma">Figma</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-premium-dark block mb-2">Hourly Rate</label>
                  <select value={rateFilter} onChange={(e) => setRateFilter(e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-200 outline-none">
                    <option value="All">Any Rate</option>
                    <option value="Low">Under ₹1,000/hr</option>
                    <option value="Medium">₹1,000 - ₹3,000/hr</option>
                    <option value="High">Above ₹3,000/hr</option>
                  </select>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-3xl font-black text-premium-dark">Explore Talent</h1>
              <p className="text-sm text-gray-500 mt-1">Hire verified professionals.</p>
            </div>
            {!user && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Viewing as Guest</span>}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-400 uppercase tracking-widest">Loading network...</div>
          ) : filteredTalent.length === 0 ? (
            <GlassCard className="!p-12 text-center text-gray-500 font-medium">No professionals match your filters.</GlassCard>
          ) : (
            filteredTalent.map((freelancer) => (
              <GlassCard key={freelancer._id} className="!p-6 shadow-sm hover:shadow-xl transition-all flex items-start gap-5">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                  {freelancer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-premium-dark">{freelancer.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">{freelancer.title}</span>
                  <p className="text-sm text-gray-600 mt-2">{freelancer.bio}</p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-black text-premium-dark">
                      ₹{freelancer.hourlyRate} <span className="text-xs font-normal text-gray-400">/ hour</span>
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => enforceAuth(() => setSelectedTalent(freelancer))}
                    >
                      Invite to Project
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
          {selectedTalent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
              <GlassCard className="w-full max-w-lg !p-8 shadow-2xl relative">
                <button 
                  onClick={() => setSelectedTalent(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold"
                >
                  ✕
                </button>
                <h2 className="text-xl font-black text-premium-dark mb-1">Invite Professional</h2>
                <p className="text-xs text-gray-500 mb-6">Messaging: <span className="font-bold text-black">{selectedTalent.name}</span></p>
                
                <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-premium-dark block mb-2">Project Details & Offer</label>
                    <textarea 
                      required
                      rows={5}
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder={`Describe your project and why you want to hire ${selectedTalent.name}...`}
                      className="w-full text-sm p-3 rounded-lg border border-gray-200 outline-none focus:border-black"
                    />
                  </div>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Transmitting...' : 'Send Secure Invitation'}
                  </Button>
                </form>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentDirectoryPage;