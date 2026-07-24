import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-signal text-white hover:bg-signal-hover shadow-sm shadow-signal/20',
  secondary: 'bg-paper-raised text-ink border border-line hover:border-graphite/40',
  secondaryDark: 'bg-transparent text-paper border border-ink-line hover:border-graphite-dark',
  ghost: 'bg-transparent text-ink hover:bg-line/60',
  ghostDark: 'bg-transparent text-paper hover:bg-white/5',
  danger: 'bg-danger text-white hover:bg-danger/90',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export default Button;
