import React from 'react';
import GlassCard from '../common/GlassCard';

const FilterSidebar = ({ filters, onFilterChange, onReset }) => {
  const categories = [
    'All Categories',
    'Web Development',
    'AI & Machine Learning',
    'UI/UX Design',
    'Mobile Apps',
    'DevOps & Cloud',
  ];

  return (
    <GlassCard className="!p-6 flex flex-col gap-6 sticky top-24 h-fit border-gray-200/80">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-premium-dark">
          Filter Workspace
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-premium-accent hover:underline"
        >
          Reset All
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-premium-muted uppercase tracking-wider">
          Category
        </label>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => {
            const isActive = (filters.category || 'All Categories') === cat;
            return (
              <button
                key={cat}
                onClick={() =>
                  onFilterChange('category', cat === 'All Categories' ? '' : cat)
                }
                className={`text-left text-xs font-medium px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-premium-dark text-white font-bold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-premium-muted uppercase tracking-wider">
            Radius
          </label>
          <span className="text-xs font-bold text-premium-dark">
            Within {filters.maxDistanceKm || 25} km
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={filters.maxDistanceKm || 25}
          onChange={(e) => onFilterChange('maxDistanceKm', e.target.value)}
          className="w-full accent-premium-dark cursor-pointer h-1.5 bg-gray-200 rounded-lg"
        />
        <span className="text-[10px] text-gray-400">
          Anchored to GPS coordinates
        </span>
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-premium-muted uppercase tracking-wider">
            Max Budget Limit
          </label>
          <span className="text-xs font-bold text-premium-dark">
            ₹{filters.maxBudget ? Number(filters.maxBudget).toLocaleString('en-IN') : '5,00,000'}
          </span>
        </div>
        <input
          type="range"
          min="10000"
          max="500000"
          step="10000"
          value={filters.maxBudget || 500000}
          onChange={(e) => onFilterChange('maxBudget', e.target.value)}
          className="w-full accent-premium-dark cursor-pointer h-1.5 bg-gray-200 rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
        <label className="text-xs font-semibold text-premium-muted uppercase tracking-wider">
          Work Environment
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['remote', 'local'].map((type) => (
            <button
              key={type}
              onClick={() =>
                onFilterChange('locationRequirement', filters.locationRequirement === type ? '' : type)
              }
              className={`text-xs font-semibold py-2 rounded-xl border capitalize transition-all ${
                filters.locationRequirement === type
                  ? 'border-premium-dark bg-premium-dark text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default FilterSidebar;