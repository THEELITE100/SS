import StarRating from '../ui/StarRating';
import { useReviewsForUser, useReviewAnalytics } from '../../features/reviews/useReviews';

const CRITERIA_LABELS = {
  avgCommunication: 'Communication',
  avgQuality: 'Quality',
  avgTimeliness: 'Timeliness',
  avgProfessionalism: 'Professionalism',
};

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-10 shrink-0 text-graphite">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-verified" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 shrink-0 text-right text-graphite">{count}</span>
    </div>
  );
}

function ReviewList({ userId }) {
  const { data: analytics } = useReviewAnalytics(userId);
  const { data, isLoading } = useReviewsForUser(userId);
  const reviews = data?.reviews || [];

  return (
    <div>
      {analytics && analytics.total > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-medium text-ink">{analytics.average?.toFixed(1)}</span>
              <StarRating value={Math.round(analytics.average)} readOnly size="sm" />
            </div>
            <p className="mt-1 text-xs text-graphite">
              Based on {analytics.total} review{analytics.total === 1 ? '' : 's'}
            </p>
            <div className="mt-4 space-y-1.5">
              <RatingBar label="5★" count={analytics.fiveStar} total={analytics.total} />
              <RatingBar label="4★" count={analytics.fourStar} total={analytics.total} />
              <RatingBar label="3★" count={analytics.threeStar} total={analytics.total} />
              <RatingBar label="2★" count={analytics.twoStar} total={analytics.total} />
              <RatingBar label="1★" count={analytics.oneStar} total={analytics.total} />
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(CRITERIA_LABELS).map(([key, label]) =>
              analytics[key] ? (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-graphite">{label}</span>
                  <span className="font-mono text-ink">{analytics[key].toFixed(1)}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-graphite">Loading reviews...</p>}
      {!isLoading && reviews.length === 0 && <p className="text-sm text-graphite">No reviews yet.</p>}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-signal-soft text-xs font-medium text-signal">
                  {review.reviewer?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-ink">{review.reviewer?.name}</span>
              </div>
              <StarRating value={review.rating} readOnly size="sm" />
            </div>
            {review.comment && <p className="mt-2 text-sm text-graphite">{review.comment}</p>}
            {review.gig?.title && <p className="mt-1 text-xs text-graphite/70">On: {review.gig.title}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewList;
