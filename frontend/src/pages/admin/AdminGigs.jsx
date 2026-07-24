import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAdminGigs, useRemoveGig } from '../../features/admin/useAdmin';

function AdminGigs() {
  const [status, setStatus] = useState('');
  const { data, isLoading, isError } = useAdminGigs({ status: status || undefined });
  const removeGig = useRemoveGig();

  const gigs = data?.gigs || [];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-paper">Gigs</h1>
      <p className="mt-1 text-graphite-dark">{data?.pagination?.total || 0} total gigs</p>

      <div className="mt-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-ink-line bg-ink-raised px-4 py-2.5 text-sm text-paper focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-graphite-dark">Loading...</p>}
        {isError && (
          <Card dark className="p-6">
            <p className="text-sm text-graphite-dark">Couldn&apos;t load gigs — needs a connected database.</p>
          </Card>
        )}

        {gigs.map((gig) => (
          <Card key={gig._id} dark className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge status={gig.status} />
                <span className="text-xs text-graphite-dark">{gig.category}</span>
              </div>
              <Link to={`/gigs/${gig._id}`} className="mt-1 block truncate text-sm font-medium text-paper hover:text-signal">
                {gig.title}
              </Link>
              <p className="text-xs text-graphite-dark">
                Client: {gig.client?.name} ({gig.client?.email})
                {gig.assignedFreelancer && ` · Freelancer: ${gig.assignedFreelancer.name}`}
              </p>
            </div>
            {gig.status !== 'cancelled' && (
              <Button
                variant="secondaryDark"
                size="sm"
                onClick={() => {
                  const reason = window.prompt('Reason for removing this gig?') || '';
                  removeGig.mutate({ id: gig._id, reason });
                }}
              >
                Remove
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdminGigs;
