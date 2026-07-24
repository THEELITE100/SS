import clsx from 'clsx';

const TONES = {
  neutral: 'bg-line/60 text-graphite',
  signal: 'bg-signal-soft text-signal',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  verified: 'bg-verified-soft text-verified',
};

// Sensible defaults so callers can just pass a raw status string
const STATUS_TONE = {
  open: 'signal',
  in_progress: 'verified',
  completed: 'success',
  cancelled: 'neutral',
  pending: 'neutral',
  accepted: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
  submitted: 'verified',
  approved: 'success',
  paid: 'success',
};

const STATUS_LABEL = {
  in_progress: 'In progress',
};

function Badge({ status, tone, children, className = '' }) {
  const resolvedTone = tone || STATUS_TONE[status] || 'neutral';
  const label = children || STATUS_LABEL[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '');

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        TONES[resolvedTone],
        className
      )}
    >
      {label}
    </span>
  );
}

export default Badge;
