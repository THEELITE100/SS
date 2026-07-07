import React from 'react';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';

const GigCard = ({ gig, aiMatchScore = null, onApply, onNegotiate }) => {
  const formattedMin = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(gig.budgetRange?.min || 0);

  const formattedMax = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(gig.budgetRange?.max || 0);

  const distanceKm = gig.distanceInMeters
    ? (gig.distanceInMeters / 1000).toFixed(1)
    : null;

  return (
    <GlassCard hoverEffect className="flex flex-col justify-between gap-5 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-premium-accent px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100">
              {gig.category || 'Engineering'}
            </span>
            {gig.locationRequirement === 'hyperlocal' && (
              <span className="text-[11px] font-semibold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                On-Site
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-premium-dark tracking-tight line-clamp-1 mt-1">
            {gig.title}
          </h3>
        </div>

        {aiMatchScore !== null && (
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs font-extrabold tracking-wide">
              {aiMatchScore}% AI Match
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {gig.description}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {gig.requiredSkills?.map((skill, index) => (
          <span
            key={index}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200/60"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            {gig.budgetType === 'hourly' ? 'Hourly Rate' : 'Fixed Project Budget'}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-extrabold text-premium-dark">
              {formattedMin} – {formattedMax}
            </span>
            {distanceKm && (
              <span className="text-xs font-medium text-gray-400 ml-2">
                ({distanceKm} km away)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNegotiate(gig)}
          >
            Bid / Negotiate
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApply(gig)}
          >
            Instant Apply
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default GigCard;