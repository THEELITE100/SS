import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAdminDisputes, useResolveDispute } from '../../features/admin/useAdmin';

const OUTCOMES = [
  { value: 'pay_freelancer', label: 'Pay freelancer' },
  { value: 'refund_client', label: 'Refund client' },
  { value: 'no_action', label: 'No action' },
];

function ResolveForm({ dispute }) {
  const [resolution, setResolution] = useState('');
  const [outcome, setOutcome] = useState('no_action');
  const resolveDispute = useResolveDispute();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolution.trim()) return;
    resolveDispute.mutate({ id: dispute._id, resolution: resolution.trim(), outcome });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-ink-line pt-4">
      <div className="flex gap-2">
        {OUTCOMES.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setOutcome(o.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              outcome === o.value ? 'border-signal bg-signal-soft text-signal' : 'border-ink-line text-graphite-dark'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="Resolution note, visible to both parties..."
        className="w-full rounded-lg border border-ink-line bg-ink px-4 py-2.5 text-sm text-paper placeholder:text-graphite-dark focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
      />
      <Button size="sm" type="submit" isLoading={resolveDispute.isPending}>
        Resolve dispute
      </Button>
    </form>
  );
}

function AdminDisputes() {
  const [status, setStatus] = useState('');
  const { data, isLoading, isError } = useAdminDisputes({ status: status || undefined });
  const disputes = data?.disputes || [];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-paper">Disputes</h1>
      <p className="mt-1 text-graphite-dark">{data?.pagination?.total || 0} total</p>

      <div className="mt-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-ink-line bg-ink-raised px-4 py-2.5 text-sm text-paper focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="under_review">Under review</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading && <p className="text-graphite-dark">Loading...</p>}
        {isError && (
          <Card dark className="p-6">
            <p className="text-sm text-graphite-dark">Couldn&apos;t load disputes — needs a connected database.</p>
          </Card>
        )}
        {!isLoading && !isError && disputes.length === 0 && (
          <Card dark className="p-10 text-center">
            <p className="text-graphite-dark">No disputes match that filter.</p>
          </Card>
        )}

        {disputes.map((dispute) => (
          <Card key={dispute._id} dark className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-verified" />
                <div>
                  <p className="text-sm font-medium text-paper">{dispute.reason}</p>
                  <p className="text-xs text-graphite-dark">
                    {dispute.raisedBy?.name} vs. {dispute.against?.name} on{' '}
                    <Link to={`/gigs/${dispute.gig?._id}`} className="hover:text-signal">
                      {dispute.gig?.title}
                    </Link>
                  </p>
                </div>
              </div>
              <Badge status={dispute.status} />
            </div>
            <p className="mt-3 text-sm text-graphite-dark">{dispute.description}</p>

            {['open', 'under_review'].includes(dispute.status) && <ResolveForm dispute={dispute} />}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdminDisputes;
