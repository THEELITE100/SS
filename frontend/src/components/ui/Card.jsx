import clsx from 'clsx';

function Card({ children, dark = false, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border',
        dark ? 'border-ink-line bg-ink-raised' : 'border-line bg-paper-raised',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
