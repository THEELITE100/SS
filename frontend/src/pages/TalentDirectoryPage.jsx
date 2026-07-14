import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

const TalentDirectoryPage = () => {
  const navigate = useNavigate();
  
  const storedUser = localStorage.getItem('userInfo');
  const user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;

  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [skillFilter, setSkillFilter] = useState('All');
  const [rateFilter, setRateFilter] = useState('All');

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const res = await apiClient.get('/freelancers/explore').catch(() => ({ data: [] }));
        
        const demoData = res.data.length > 0 ? res.data : [
          { _id: '1', name: 'Alice JS', title: 'React Expert', skills: ['React', 'Node'], hourlyRate: 2000, bio: '5 years building SPAs.' },
          { _id: '2', name: 'Bob Design', title: 'UI/UX Lead', skills: ['Figma', 'UI/UX'], hourlyRate: 1500, bio: 'Apple-inspired design.' }
        ];
        setFreelancers(demoData);
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
                      onClick={() => enforceAuth(() => console.log('Contact opened'))}
                    >
                      Invite to Project
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentDirectoryPage;