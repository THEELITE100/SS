import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all duration-200 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer shadow-sm';

  const variants = {
    primary:
      'bg-black text-white hover:bg-gray-800 border border-transparent shadow-md',
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200',
    accent:
      'bg-blue-600 text-white hover:bg-blue-700 border border-transparent shadow-md',
    glass:
      'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30',
    outline:
      'bg-transparent text-gray-900 border border-gray-300 hover:border-black hover:bg-gray-50',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 rounded-full',
    md: 'text-sm px-5 py-2.5 rounded-full',
    lg: 'text-base px-7 py-3 rounded-full',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;