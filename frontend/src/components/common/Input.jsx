import React from 'react';

const Input = ({ label, name, type = 'text', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-premium-dark uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        name={name}
        type={type}
        className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-black transition-colors"
        {...props} 
      />
    </div>
  );
};

export default Input;