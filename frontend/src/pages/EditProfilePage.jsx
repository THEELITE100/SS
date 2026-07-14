import React, { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import GlassCard from '../components/common/GlassCard';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import TwoFactorModal from '../components/specific/TwoFactorModal';

const EditProfilePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    hourlyRate: '',
    skills: '',
    portfolioLink: '',
    availability: 'Available'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [is2FAOpen, setIs2FAOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/freelancer/profile');
        if (res.data && Object.keys(res.data).length > 0) {
          setFormData({
            title: res.data.title || '',
            bio: res.data.bio || '',
            hourlyRate: res.data.hourlyRate || '',
            skills: res.data.skills ? res.data.skills.join(', ') : '',
            portfolioLink: res.data.portfolioLink || '',
            availability: res.data.availability || 'Available'
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/freelancer/profile', formData);
      alert('Profile successfully updated.');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-[calc(100vh-72px)] flex justify-center items-center font-bold text-xs uppercase tracking-widest text-gray-400">Loading Workspace...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl font-black text-premium-dark">Workspace Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Manage your public presence and security configurations.</p>
        </div>

        <GlassCard className="!p-8 shadow-xl">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Professional Identity</h2>
              <Input label="Professional Title" name="title" placeholder="e.g. Senior React Engineer" value={formData.title} onChange={handleChange} />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Biography</label>
                <textarea name="bio" rows={4} placeholder="Describe your expertise..." value={formData.bio} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-black" />
              </div>
              
              <Input label="Hourly Rate (INR)" name="hourlyRate" type="number" placeholder="1500" value={formData.hourlyRate} onChange={handleChange} />
              <Input label="Skills (Comma Separated)" name="skills" placeholder="React, Node.js, MongoDB" value={formData.skills} onChange={handleChange} />
              <Input label="Portfolio URL" name="portfolioLink" type="url" placeholder="https://..." value={formData.portfolioLink} onChange={handleChange} />
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Recurring Availability Schedule</h2>
              <select name="availability" value={formData.availability} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none bg-white">
                <option value="Available">Available for new projects</option>
                <option value="Busy">Currently busy</option>
                <option value="Not Looking">Not looking for work</option>
              </select>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Security & Multi-Factor Auth</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="text-sm font-bold text-premium-dark">Two-Factor Authentication (2FA)</p>
                  <p className="text-xs text-gray-500">Protect your payouts and workspace data.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setIs2FAOpen(true)}>
                  Configure 2FA
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <Button type="submit" variant="primary" size="md" disabled={isSaving}>
                {isSaving ? 'Syncing...' : 'Save Configurations'}
              </Button>
            </div>

          </form>
        </GlassCard>

        <TwoFactorModal isOpen={is2FAOpen} onClose={() => setIs2FAOpen(false)} onSuccess={() => console.log('2FA Enabled')} />
      </div>
    </div>
  );
};

export default EditProfilePage;