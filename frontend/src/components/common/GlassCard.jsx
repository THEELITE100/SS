import React from 'react';

const GlassCard = ({
  children,
  className = '',
  hoverEffect = false,
  dark = false,
}) => {
  const baseStyles = 'rounded-2xl border transition-all duration-300';
  
  const themeStyles = dark
    ? 'bg-black/60 backdrop-blur-xl border-white/10 text-white shadow-2xl shadow-black/50'
    : 'bg-white/80 backdrop-blur-xl border-gray-200/60 text-premium-dark shadow-xl shadow-gray-200/50';

  const hoverStyles = hoverEffect
    ? 'hover:-translate-y-1 hover:shadow-2xl hover:border-gray-300/80 cursor-pointer'
    : '';

  return (
    <div className={`${baseStyles} ${themeStyles} ${hoverStyles} p-6 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;