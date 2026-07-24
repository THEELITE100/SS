import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';
import { useCreateReview } from '../../features/reviews/useReviews';

const CRITERIA = [
  { key: 'communication', label: 'Communication' },
  { key: 'quality', label: 'Quality of work' },
  { key: 'timeliness', label: 'Timeliness' },
  { key: 'professionalism', label: 'Professionalism' },
];

function ReviewForm({ gigId, revieweeName, onDone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [criteria, setCriteria] = useState({});
  const createReview = useCreateReview(gigId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    createReview.mutate({ rating, comment, criteria }, { onSuccess: () => onDone?.() });
  };

  return (
    <Card className="p-6">
      <h3 className="text-base font-medium text-ink">Leave a review for {revieweeName}</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-graphite">Overall rating</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <label className="mb-1.5 block text-xs font-medium text-graphite">{c.label}</label>
              <StarRating value={criteria[c.key] || 0} onChange={(v) => setCriteria({ ...criteria, [c.key]: v })} size="sm" />
            </div>
          ))}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-graphite">Comment (optional)</label>
          <textarea
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How did it go?"
            className="w-full rounded-lg border border-line bg-paper-raised px-4 py-2.5 text-sm text-ink placeholder:text-graphite/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
          />
        </div>

        <Button type="submit" disabled={rating === 0} isLoading={createReview.isPending}>
          Submit review
        </Button>
      </form>
    </Card>
  );
}

export default ReviewForm;
