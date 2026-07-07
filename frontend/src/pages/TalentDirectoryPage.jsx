import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';
import FreelancerCard from '../components/specific/FreelancerCard';
import Input from '../components/common/Input';

const fallbackFreelancers = [
  {
    _id: '1',
    name: 'Aarav Sharma',
    location: { city: 'Noida, UP' },
    profile: {
      headline: 'Senior MERN & AI Architect',
      hourlyRate: 2500,
      reputationScore: 4.9,
      skills: ['React', 'Node.js', 'MongoDB Atlas', 'Tailwind CSS', 'Python'],
      bio: '7+ years building enterprise SaaS platforms across Noida and NCR. Specialized in high-performance web applications and real-time Socket.IO systems.'
    }
  },
  {
    _id: '2',
    name: 'Priya Patel',
    location: { city: 'Bangalore / Remote' },
    profile: {
      headline: 'Machine Learning & Hugging Face Specialist',
      hourlyRate: 3500,
      reputationScore: 5.0,
      skills: ['Python', 'PyTorch', 'Hugging Face', 'Vector DBs', 'FastAPI'],
      bio: 'AI researcher and consultant helping startups integrate semantic search, vector matching, and LLM workflows into production applications.'
    }
  },
  {
    _id: '3',
    name: 'Rohan Verma',
    location: { city: 'Noida Sector 62' },
    profile: {
      headline: 'DevOps & Stripe Escrow Infrastructure Lead',
      hourlyRate: 2000,
      reputationScore: 4.8,
      skills: ['Docker', 'AWS', 'Stripe Connect', 'Express.js', 'CI/CD'],
      bio: 'Focusing on secure backend payment pipelines, automated deployment workflows, and zero-downtime database scaling.'
    }
  }
];

const TalentDirectoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['freelancers', searchQuery],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/search/freelancers?skills=${searchQuery}`);
        if (!res.data || !res.data.freelancers || res.data.freelancers.length === 0) {
          return { count: fallbackFreelancers.length, freelancers: fallbackFreelancers };
        }
        return res.data;
      } catch (err) {
        return { count: fallbackFreelancers.length, freelancers: fallbackFreelancers };
      }
    }
  });

  const displayList = data?.freelancers || fallbackFreelancers;

  return (
    <div className="min-h-screen bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">
              Talent Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-premium-dark mt-1">
              Top Local & Remote Talent
            </h1>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search talent by skills (e.g. React, AI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs font-bold text-gray-500">Scanning talent network...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayList.map((freelancer) => (
              <FreelancerCard
                key={freelancer._id}
                freelancer={freelancer}
                onHire={(f) => alert(`Opening interview room with ${f.name}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default TalentDirectoryPage;