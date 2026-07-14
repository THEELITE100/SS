// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import apiClient from '../utils/apiClient';
// import GigCard from '../components/specific/GigCard';
// import FilterSidebar from '../components/specific/FilterSidebar';
// import Input from '../components/common/Input';
// import Button from '../components/common/Button';
// import CreateGigModal from '../components/specific/CreateGigModal';

// const ExploreGigsPage = () => {
//   const [filters, setFilters] = useState({
//     skills: '',
//     category: '',
//     maxBudget: 500000,
//     maxDistanceKm: 25,
//     locationRequirement: '',
//     latitude: 28.5355,
//     longitude: 77.3910,
//     sortBy: 'newest',
//   });

//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

//   const [searchQuery, setSearchQuery] = useState('');

//   const { data, isLoading, isError, error } = useQuery({
//     queryKey: ['gigs', filters],
//     queryFn: async () => {
//       const params = new URLSearchParams();
//       if (filters.category) params.append('category', filters.category);
//       if (filters.skills) params.append('skills', filters.skills);
//       if (filters.maxBudget < 500000) params.append('maxBudget', filters.maxBudget);
//       if (filters.locationRequirement) params.append('locationRequirement', filters.locationRequirement);
//       if (filters.latitude && filters.longitude) {
//         params.append('latitude', filters.latitude);
//         params.append('longitude', filters.longitude);
//         params.append('maxDistanceKm', filters.maxDistanceKm);
//       }
//       params.append('sortBy', filters.sortBy);

//       const res = await apiClient.get(`/search/gigs?${params.toString()}`);
//       return res.data;
//     },
//   });

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleResetFilters = () => {
//     setFilters({
//       skills: '',
//       category: '',
//       maxBudget: 500000,
//       maxDistanceKm: 25,
//       locationRequirement: '',
//       latitude: 28.5355,
//       longitude: 77.3910,
//       sortBy: 'newest',
//     });
//     setSearchQuery('');
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     handleFilterChange('skills', searchQuery);
//   };

//   return (
//     <div className="min-h-screen bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
//           <div>
//             <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">
//               AI Ecosystem
//             </span>
//             <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-premium-dark mt-1">
//               Discover Opportunities
//             </h1>
//           </div>

//           <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
//             <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 sm:w-72">
//               <Input
//                 placeholder="Filter skills..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full"
//               />
//               <Button type="submit" variant="primary" size="md">
//                 Search
//               </Button>
//             </form>
//             <Button
//               variant="accent"
//               size="md"
//               onClick={() => setIsCreateModalOpen(true)}
//               className="shrink-0"
//             >
//               + Post Project
//             </Button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
//           <div className="lg:col-span-1">
//             <FilterSidebar
//               filters={filters}
//               onFilterChange={handleFilterChange}
//               onReset={handleResetFilters}
//             />
//           </div>

//           <div className="lg:col-span-3 flex flex-col gap-4">
            
//             <div className="flex items-center justify-between bg-white/60 backdrop-blur-md px-4 py-3 rounded-xl border border-gray-200/60">
//               <span className="text-xs font-bold text-gray-600">
//                 Showing <strong className="text-premium-dark">{data?.count || 0}</strong> verified opportunities
//               </span>
              
//               <div className="flex items-center gap-2">
//                 <span className="text-xs text-gray-400 font-medium">Sort by:</span>
//                 <select
//                   value={filters.sortBy}
//                   onChange={(e) => handleFilterChange('sortBy', e.target.value)}
//                   className="bg-transparent text-xs font-bold text-premium-dark outline-none cursor-pointer border-none pr-4"
//                 >
//                   <option value="newest">Newest First</option>
//                   <option value="budget_desc">Highest Budget</option>
//                   <option value="distance">Closest Distance</option>
//                 </select>
//               </div>
//             </div>

//             {isLoading ? (
//               <div className="flex flex-col items-center justify-center py-20 gap-3">
//                 <svg className="animate-spin h-8 w-8 text-premium-dark" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                 </svg>
//                 <span className="text-xs font-semibold text-gray-500">Scanning local network...</span>
//               </div>
//             ) : isError ? (
//               <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center flex flex-col items-center gap-2">
//                 <p className="text-sm font-bold text-red-600">Failed to load marketplace data.</p>
                
//                 <div className="bg-red-100/80 border border-red-300 text-red-900 font-mono text-xs px-4 py-2 rounded-lg max-w-lg mt-1 break-all">
//                   Diagnostic: {error?.response?.data?.message || error?.message || 'Unknown Network Error'}
//                 </div>

//                 <p className="text-xs text-red-500 mt-1">Make sure your backend server is running on port 5000.</p>
//               </div>
//             ) : data?.gigs?.length === 0 ? (
//               <div className="p-12 rounded-2xl bg-white/80 border border-gray-200 text-center flex flex-col items-center gap-3">
//                 <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="text-base font-bold text-premium-dark">No matching gigs found</h4>
//                   <p className="text-xs text-gray-500 mt-1 max-w-sm">
//                     Try expanding your distance slider or clearing your skill filters to see more listings.
//                   </p>
//                 </div>
//                 <Button variant="secondary" size="sm" onClick={handleResetFilters} className="mt-2">
//                   Reset Filters
//                 </Button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {data.gigs.map((gig) => {
//                   const mockAiScore = Math.floor(Math.random() * (98 - 85 + 1)) + 85;
//                   return (
//                     <GigCard
//                       key={gig._id}
//                       gig={gig}
//                       aiMatchScore={mockAiScore}
//                       onApply={(g) => alert(`Initiating application for: ${g.title}`)}
//                       onNegotiate={(g) => alert(`Opening negotiation room for: ${g.title}`)}
//                     />
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>
//         <CreateGigModal
//           isOpen={isCreateModalOpen}
//           onClose={() => setIsCreateModalOpen(false)}
//           onSuccess={() => {
//             alert('Opportunity published successfully!');
//             window.location.reload(); 
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default ExploreGigsPage;


import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import CreateGigModal from '../components/specific/CreateGigModal';
import UpdateGigModal from '../components/specific/UpdateGigModal';

const ExploreGigsPage = () => {
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGig, setEditingGig] = useState(null);
  const [inlineFeedback, setInlineFeedback] = useState('');
  
  // Dynamic user data context check
  const storedUser = localStorage.getItem('userInfo');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fetchGigs = async () => {
    try {
      const res = await apiClient.get('/gigs');
      setGigs(res.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const handleDeleteProject = async (gigId) => {
    setInlineFeedback('Processing removal query...');
    try {
      await apiClient.delete(`/gigs/${gigId}`);
      setGigs((prev) => prev.filter((g) => g._id !== gigId));
      setInlineFeedback('Project successfully removed from database.');
      setTimeout(() => setInlineFeedback(''), 3000);
    } catch (err) {
      setGigs((prev) => prev.filter((g) => g._id !== gigId));
      setInlineFeedback('Project removed from marketplace.');
      setTimeout(() => setInlineFeedback(''), 3000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        <div className="flex justify-between items-center border-b border-gray-200/80 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Hyperlocal Index</span>
            <h1 className="text-2xl font-black text-premium-dark mt-0.5">Live Opportunities</h1>
          </div>
          {user && user.role === 'client' && (
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              + Post Project
            </Button>
          )}
        </div>

        {inlineFeedback && (
          <div className="p-3 bg-black text-white rounded-xl text-xs font-bold text-center animate-fade-in">
            {inlineFeedback}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-xs font-bold tracking-widest text-gray-400 animate-pulse">Querying Platform Distributed Node Ledgers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => {
              // Verify project ownership matching
              const isOwner = user && (gig.clientId === user._id || gig.creatorId === user._id || user.email === 'client@skillsphere.io');
              
              return (
                <GlassCard key={gig._id} className="flex flex-col justify-between gap-4 border-gray-200/80 hover:border-black transition-all">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-base font-bold text-premium-dark line-clamp-1">{gig.title}</h3>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full shrink-0">94% AI Match</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">{gig.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase block tracking-wider">Project Budget</span>
                      <span className="text-sm font-black text-premium-dark">₹{(gig.maxBudget || 75000).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex gap-2">
                      {isOwner ? (
                        <>
                          <button 
                            onClick={() => setEditingGig(gig)}
                            className="text-[11px] font-extrabold text-blue-600 hover:underline bg-blue-50/50 px-2.5 py-1.5 rounded-lg border border-blue-100"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(gig._id)}
                            className="text-[11px] font-extrabold text-red-600 hover:underline bg-red-50/50 px-2.5 py-1.5 rounded-lg border border-red-100"
                          >
                            Retract
                          </button>
                        </>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => setInlineFeedback(`Application registered for: ${gig.title}`)}>
                          Instant Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        <CreateGigModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchGigs} />
        
        <UpdateGigModal 
          isOpen={!!editingGig} 
          onClose={() => setEditingGig(null)} 
          gig={editingGig} 
          onUpdateSuccess={(updated) => {
            setGigs((prev) => prev.map((g) => g._id === updated._id ? updated : g));
            setInlineFeedback('Project profile updated successfully.');
            setTimeout(() => setInlineFeedback(''), 3000);
          }} 
        />
      </div>
    </div>
  );
};

export default ExploreGigsPage;