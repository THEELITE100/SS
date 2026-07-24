import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useMyDisputes } from '../../features/disputes/useDisputes';

function Disputes() {
  const { user } = useSelector((state) => state.auth);
  const { data: disputes, isLoading, isError } = useMyDisputes();

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-paper">Disputes</h1>
      <p className="mt-1 text-graphite-dark">Anything raised on a gig you&apos;re part of, from either side.</p>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-graphite-dark">Loading...</p>}
        {isError && (
          <Card dark className="p-6">
            <p className="text-sm text-graphite-dark">Couldn&apos;t load disputes — needs a connected database.</p>
          </Card>
        )}
        {!isLoading && !isError && disputes?.length === 0 && (
          <Card dark className="p-10 text-center">
            <p className="text-graphite-dark">No disputes — hopefully it stays that way.</p>
          </Card>
        )}

        {disputes?.map((dispute) => {
          const otherParty = String(dispute.raisedBy?._id) === String(user._id) ? dispute.against : dispute.raisedBy;
          const iRaisedIt = String(dispute.raisedBy?._id) === String(user._id);
          return (
            <Link key={dispute._id} to={`/dashboard/disputes/${dispute._id}`}>
              <Card dark className="flex items-center justify-between gap-4 p-4 transition-colors hover:border-signal/40">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-verified" />
                  <div>
                    <p className="text-sm font-medium text-paper">{dispute.reason}</p>
                    <p className="text-xs text-graphite-dark">
                      {iRaisedIt ? 'You raised this against' : 'Raised against you by'} {otherParty?.name} on{' '}
                      {dispute.gig?.title}
                    </p>
                  </div>
                </div>
                <Badge status={dispute.status} />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Disputes;
