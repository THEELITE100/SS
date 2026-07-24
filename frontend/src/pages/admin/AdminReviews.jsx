import { AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';
import { useFlaggedReviews, useResolveFlaggedReview } from '../../features/admin/useAdmin';

function AdminReviews() {
  const { data, isLoading, isError } = useFlaggedReviews();
  const resolveReview = useResolveFlaggedReview();

  const reviews = data?.reviews || [];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-paper">Flagged reviews</h1>
      <p className="mt-1 text-graphite-dark">
        Reviews the fraud heuristics flagged for a human to look at — not a verdict, just a signal.
      </p>

      <div className="mt-6 space-y-4">
        {isLoading && <p className="text-graphite-dark">Loading...</p>}
        {isError && (
          <Card dark className="p-6">
            <p className="text-sm text-graphite-dark">Couldn&apos;t load flagged reviews — needs a connected database.</p>
          </Card>
        )}
        {!isLoading && !isError && reviews.length === 0 && (
          <Card dark className="p-10 text-center">
            <p className="text-graphite-dark">No flagged reviews right now.</p>
          </Card>
        )}

        {reviews.map((review) => (
          <Card key={review._id} dark className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-paper">
                    {review.reviewer?.name} → {review.reviewee?.name}
                  </p>
                  <StarRating value={review.rating} readOnly size="sm" />
                </div>
                <p className="text-xs text-graphite-dark">On: {review.gig?.title}</p>
              </div>
            </div>

            {review.comment && <p className="mt-3 text-sm text-graphite-dark">&ldquo;{review.comment}&rdquo;</p>}

            <div className="mt-3 flex items-start gap-2 rounded-lg bg-verified/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
              <p className="text-xs text-verified">{review.fraudReason}</p>
            </div>

            <div className="mt-4 flex gap-3">
              <Button size="sm" onClick={() => resolveReview.mutate({ id: review._id, action: 'dismiss' })} isLoading={resolveReview.isPending}>
                Dismiss flag (keep review)
              </Button>
              <Button
                size="sm"
                variant="secondaryDark"
                onClick={() => resolveReview.mutate({ id: review._id, action: 'remove' })}
                isLoading={resolveReview.isPending}
              >
                Remove review
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdminReviews;
