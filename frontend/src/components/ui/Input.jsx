import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-graphite">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" aria-hidden="true" />
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-lg border border-line bg-paper-raised px-4 py-2.5 text-sm text-ink placeholder:text-graphite/60',
            'transition-colors focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal',
            Icon && 'pl-10',
            error && 'border-danger focus:border-danger focus:ring-danger',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
