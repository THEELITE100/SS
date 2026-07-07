import React, { useState } from 'react';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import BookingModal from './BookingModal';

const FreelancerCard = ({ freelancer, onHire }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const profile = freelancer.profile || {};
  const hourlyRate = profile.hourlyRate ? `₹${profile.hourlyRate}/hr` : '₹1,500/hr';

  return (
    <>
      <GlassCard hoverEffect className="flex flex-col justify-between gap-5 transition-all duration-300">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
              {freelancer.name ? freelancer.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-premium-dark tracking-tight">
                  {freelancer.name || 'Verified Specialist'}
                </h3>
                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Verified Talent
                </span>
              </div>
              <p className="text-xs text-premium-accent font-semibold mt-0.5 line-clamp-1">
                {profile.headline || 'Full-Stack & AI Systems Architect'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-base font-black text-premium-dark block">{hourlyRate}</span>
            <span className="text-[11px] font-bold text-amber-500">★ {profile.reputationScore || '5.0'} Rating</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {profile.bio || 'Experienced software professional specializing in scalable MERN stack architectures, real-time WebSockets, and Hugging Face vector integrations.'}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {(profile.skills || ['React', 'Node.js', 'MongoDB', 'AI Embeddings', 'Tailwind']).map((skill, index) => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            return (
              <span key={index} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200/60">
                {skillName}
              </span>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">
            📍 {freelancer.location?.city || 'Noida, India'}
          </span>
          <Button variant="primary" size="sm" onClick={() => setIsBookingOpen(true)}>
            Schedule / Hire
          </Button>
        </div>
      </GlassCard>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        freelancer={freelancer}
        onSuccess={() => {
          alert(`Consultation booked successfully with ${freelancer.name}! A calendar invitation has been dispatched.`);
          if (onHire) onHire(freelancer);
        }}
      />
    </>
  );
};

export default FreelancerCard;