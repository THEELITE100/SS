import React from 'react';

const RoleSelector = ({ selectedRole, onSelect }) => {
  const roles = [
    {
      id: 'client',
      title: 'I want to hire talent',
      description: 'Post gigs, review AI recommendations, and manage milestone payments.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'freelancer',
      title: 'I want to find work',
      description: 'Build a verified portfolio, get AI-matched jobs, and receive secure payouts.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
        Select Your Account Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <div
              key={role.id}
              onClick={() => onSelect(role.id)}
              className={`relative flex flex-col justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-200 select-none
                ${
                  isSelected
                    ? 'border-premium-dark bg-premium-dark/5 shadow-md ring-1 ring-premium-dark'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-premium-dark text-white' : 'bg-gray-100 text-premium-dark'}`}>
                  {role.icon}
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                  ${isSelected ? 'border-premium-dark bg-premium-dark text-white' : 'border-gray-300 bg-transparent'}`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-premium-dark mb-1">{role.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{role.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;