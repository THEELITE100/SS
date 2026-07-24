import { Star } from 'lucide-react';
import clsx from 'clsx';

const SIZES = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-7 w-7' };

function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  return (
    <div className="flex gap-0.5" role={readOnly ? undefined : 'radiogroup'} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star className={clsx(SIZES[size], n <= value ? 'fill-verified text-verified' : 'fill-none text-line')} />
        </button>
      ))}
    </div>
  );
}

export default StarRating;
