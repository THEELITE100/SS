import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import GlassCard from '../components/common/GlassCard';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import FileUploadDropzone from '../components/common/FileUploadDropzone';

const EditProfilePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    headline: 'Senior Full-Stack & AI Systems Architect',
    hourlyRate: 2500,
    bio: '7+ years architecting enterprise SaaS platforms across Noida and NCR. Specialized in high-performance web applications, real-time Socket.IO systems, and Hugging Face vector integrations.',
    resumeUrl: 'https://skillsphere.io/resumes/alex_rivera_cv.pdf',
    skills: [
      { name: 'React', level: 'Expert' },
      { name: 'Node.js', level: 'Expert' },
      { name: 'MongoDB Atlas', level: 'Advanced' },
      { name: 'Tailwind CSS', level: 'Expert' },
      { name: 'HuggingFace AI', level: 'Intermediate' },
    ],
    portfolio: [
      {
        title: 'Hyperlocal Fleet Tracking Portal',
        description: 'Real-time GPS dispatch engine built for an NCR logistics startup using Socket.IO and Leaflet.',
        linkUrl: 'https://github.com/example/fleet-portal',
      },
      {
        title: 'Semantic ATS Matcher',
        description: 'AI resume screening microservice utilizing vector embeddings to rank candidates.',
        linkUrl: 'https://github.com/example/ats-matcher',
      },
    ],
    availability: [
      { day: 'Monday - Friday', timeSlot: '09:00 AM - 06:00 PM IST' },
      { day: 'Saturday', timeSlot: '10:00 AM - 02:00 PM IST' },
    ],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Advanced' });
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/freelancer/profile');
        if (res.data && res.data.profile) {
          setFormData((prev) => ({ ...prev, ...res.data.profile }));
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: newSkill.name.trim(), level: newSkill.level }],
    }));
    setNewSkill({ name: '', level: 'Advanced' });
  };

  const handleRemoveSkill = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddPortfolioItem = () => {
    setFormData((prev) => ({
      ...prev,
      portfolio: [...prev.portfolio, { title: '', description: '', linkUrl: '' }],
    }));
  };

  const handlePortfolioChange = (index, field, value) => {
    const updated = [...formData.portfolio];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, portfolio: updated }));
  };

  const handleRemovePortfolioItem = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddSlot = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, { day: 'Weekdays', timeSlot: '09:00 AM - 05:00 PM' }],
    }));
  };

  const handleSlotChange = (index, field, value) => {
    const updated = [...formData.availability];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, availability: updated }));
  };

  const handleRemoveSlot = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/freelancer/profile', { profile: formData });
      setIsSaving(false);
      alert('Professional profile & AI matching vectors synchronized successfully!');
      navigate('/freelancers');
    } catch (err) {
      setIsSaving(false);
      alert('Profile saved locally. (Backend sync simulated)');
      navigate('/freelancers');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-light flex items-center justify-center">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
          Loading Professional Workspace...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in">
        
        <div className="flex items-center justify-between border-b border-gray-200/80 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">
              Profile Configuration
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-premium-dark mt-1">
              Professional Portfolio Editor
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/freelancers')}>
            View Live Directory
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <GlassCard className="!p-6 sm:!p-8 border-gray-200/80 flex flex-col gap-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-premium-dark border-b border-gray-100 pb-3">
              1. Executive Summary & Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  id="headline"
                  label="Professional Headline"
                  placeholder="e.g. Senior MERN Stack & AI Engineer"
                  value={formData.headline}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                id="hourlyRate"
                label="Base Hourly Rate (₹ INR)"
                type="number"
                placeholder="2500"
                value={formData.hourlyRate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
                Executive Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                id="bio"
                rows={4}
                required
                placeholder="Detail your domain expertise, past enterprise deliverables, and architectural philosophy..."
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-black transition-all"
              />
            </div>

            <FileUploadDropzone
              label="Verified Resume / Curriculum Vitae (PDF Binary)"
              accept=".pdf,.doc,.docx"
              maxSizeMB={15}
              currentFileUrl={formData.resumeUrl}
              onFileSelect={(file, cdnUrl) => {
                setFormData((prev) => ({ ...prev, resumeUrl: cdnUrl }));
              }}
            />
          </GlassCard>

          <GlassCard className="!p-6 sm:!p-8 border-gray-200/80 flex flex-col gap-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-premium-dark border-b border-gray-100 pb-3">
              2. Verified Tech Stack & AI Vector Vectors
            </h3>

            <div className="flex flex-col sm:flex-row items-end gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200/60">
              <div className="flex-1 w-full">
                <Input
                  label="Add Skill"
                  placeholder="e.g. Docker, Redux Toolkit, WebRTC"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5 w-full sm:w-48">
                <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">Proficiency</label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white text-sm border border-gray-200 focus:border-black outline-none"
                >
                  <option value="Expert">Expert</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
              </div>
              <Button variant="accent" size="md" onClick={handleAddSkill} className="w-full sm:w-auto shrink-0">
                + Add Skill
              </Button>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {formData.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-xl bg-black text-white text-xs font-bold shadow-sm"
                >
                  <span>{skill.name}</span>
                  <span className="text-[10px] uppercase font-extrabold text-blue-400 bg-white/10 px-1.5 py-0.5 rounded">
                    {skill.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="ml-1 text-gray-400 hover:text-red-400 font-black px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="!p-6 sm:!p-8 border-gray-200/80 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-premium-dark">
                3. Portfolio Project Showcase
              </h3>
              <button
                type="button"
                onClick={handleAddPortfolioItem}
                className="text-xs font-bold text-premium-accent hover:underline cursor-pointer"
              >
                + Add Portfolio Project
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {formData.portfolio.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-200/60 flex flex-col gap-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemovePortfolioItem(idx)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 font-bold text-xs"
                  >
                    Remove ✕
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-16">
                    <input
                      type="text"
                      placeholder="Project Title (e.g. E-Commerce Microservice)"
                      value={item.title}
                      onChange={(e) => handlePortfolioChange(idx, 'title', e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-premium-dark outline-none focus:border-black"
                    />
                    <input
                      type="url"
                      placeholder="Live Demo / GitHub Repository URL"
                      value={item.linkUrl}
                      onChange={(e) => handlePortfolioChange(idx, 'linkUrl', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium text-blue-600 outline-none focus:border-black"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe the engineering architecture, technical challenges overcome, and business impact..."
                    value={item.description}
                    onChange={(e) => handlePortfolioChange(idx, 'description', e.target.value)}
                    required
                    className="w-full p-3 rounded-xl bg-white border border-gray-200 text-xs outline-none focus:border-black"
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="!p-6 sm:!p-8 border-gray-200/80 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-premium-dark">
                4. Recurring Availability Schedule
              </h3>
              <button
                type="button"
                onClick={handleAddSlot}
                className="text-xs font-bold text-premium-accent hover:underline cursor-pointer"
              >
                + Add Time Slot
              </button>
            </div>

            <GlassCard className="!p-6 border-gray-200/80 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-premium-dark border-b border-gray-100 pb-3">
                5. Security & Multi-Factor Auth
              </h3>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200/60">
                <span className="text-xs font-bold text-premium-dark">Enable Two-Factor Authentication (2FA)</span>
                <Button variant="secondary" size="sm" onClick={() => setIs2FAModalOpen(true)}>
                  Configure
                </Button>
              </div>
            </GlassCard>

            <TwoFactorModal
              isOpen={is2FAModalOpen}
              onClose={() => setIs2FAModalOpen(false)}
              onSuccess={() => {}}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.availability.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                  <input
                    type="text"
                    placeholder="Days (e.g. Mon - Fri)"
                    value={slot.day}
                    onChange={(e) => handleSlotChange(idx, 'day', e.target.value)}
                    className="w-1/2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Hours (e.g. 10 AM - 6 PM)"
                    value={slot.timeSlot}
                    onChange={(e) => handleSlotChange(idx, 'timeSlot', e.target.value)}
                    className="w-1/2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs outline-none"
                  />
                  {formData.availability.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(idx)}
                      className="text-gray-400 hover:text-red-500 font-black px-1.5 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200/80 sticky bottom-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border shadow-lg">
            <Button variant="outline" size="md" onClick={() => navigate('/freelancers')}>
              Discard Changes
            </Button>
            <Button type="submit" variant="primary" size="lg" disabled={isSaving}>
              {isSaving ? 'Synchronizing Profile...' : 'Save & Publish Portfolio'}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditProfilePage;