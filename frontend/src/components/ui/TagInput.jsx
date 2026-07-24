import { useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

function TagInput({ label, value = [], onChange, placeholder = 'Type and press Enter', dark = false }) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft('');
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className={clsx('mb-2 block text-sm font-medium', dark ? 'text-graphite-dark' : 'text-graphite')}>
          {label}
        </label>
      )}
      <div
        className={clsx(
          'flex flex-wrap gap-2 rounded-lg border px-3 py-2.5',
          dark ? 'border-ink-line bg-ink' : 'border-line bg-paper-raised'
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-md bg-signal-soft px-2.5 py-1 text-xs font-medium text-signal"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ''}
          className={clsx(
            'min-w-[120px] flex-1 bg-transparent text-sm outline-none',
            dark ? 'text-paper placeholder:text-graphite-dark' : 'text-ink placeholder:text-graphite/60'
          )}
        />
      </div>
    </div>
  );
}

export default TagInput;
