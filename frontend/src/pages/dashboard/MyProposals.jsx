import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useMyProposals, useWithdrawProposal } from '../../features/proposals/useProposals';

function MyProposals() {
  const { data: proposals, isLoading, isError } = useMyProposals();
  const withdrawProposal = useWithdrawProposal();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-paper">Your proposals</h1>
          <p className="mt-1 text-graphite-dark">Every gig you&apos;ve applied to, and where it stands.</p>
        </div>
        <Link to="/gigs">
          <Button variant="secondaryDark">
            <Search className="h-4 w-4" /> Browse gigs
          </Button>
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-graphite-dark">Loading...</p>}

        {isError && (
          <Card dark className="p-6">
            <p className="text-sm text-graphite-dark">
              Couldn&apos;t load your proposals — this needs a connected database. Once MongoDB Atlas is set up,
              this list populates live.
            </p>
          </Card>
        )}

        {!isLoading && !isError && proposals?.length === 0 && (
          <Card dark className="p-10 text-center">
            <p className="text-graphite-dark">You haven&apos;t submitted any proposals yet.</p>
            <Link to="/gigs">
              <Button className="mt-4">Find your first gig</Button>
            </Link>
          </Card>
        )}

        {proposals?.map((proposal) => (
          <Card key={proposal._id} dark className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Badge status={proposal.status} />
                <Link
                  to={`/gigs/${proposal.gig?._id}`}
                  className="mt-2 block truncate text-base font-medium text-paper hover:text-signal"
                >
                  {proposal.gig?.title}
                </Link>
                <p className="mt-1 font-mono text-xs text-graphite-dark">
                  Your bid: {proposal.gig?.currency} {proposal.bidAmount?.toLocaleString()}
                </p>
              </div>
              {proposal.status === 'pending' && (
                <Button
                  variant="ghostDark"
                  size="sm"
                  onClick={() => withdrawProposal.mutate(proposal._id)}
                  isLoading={withdrawProposal.isPending}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MyProposals;
