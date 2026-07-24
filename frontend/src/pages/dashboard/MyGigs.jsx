import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useMyGigs } from '../../features/gigs/useGigs';

function MyGigs() {
  const { data: gigs, isLoading, isError } = useMyGigs();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-paper">Your gigs</h1>
          <p className="mt-1 text-graphite-dark">Everything you&apos;ve posted, and where each one stands.</p>
        </div>
        <Link to="/gigs/new">
          <Button>
            <Plus className="h-4 w-4" /> Post a gig
          </Button>
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-graphite-dark">Loading...</p>}

        {isError && (
          <Card dark className="p-6">
            <p className="text-sm text-graphite-dark">
              Couldn&apos;t load your gigs — this needs a connected database. Once MongoDB Atlas is set up, this
              list populates live.
            </p>
          </Card>
        )}

        {!isLoading && !isError && gigs?.length === 0 && (
          <Card dark className="p-10 text-center">
            <p className="text-graphite-dark">You haven&apos;t posted a gig yet.</p>
            <Link to="/gigs/new">
              <Button className="mt-4">Post your first gig</Button>
            </Link>
          </Card>
        )}

        {gigs?.map((gig) => (
          <Card key={gig._id} dark className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge status={gig.status} />
                  <span className="text-xs text-graphite-dark">{gig.applicationsCount || 0} proposals</span>
                </div>
                <Link to={`/gigs/${gig._id}`} className="mt-2 block truncate text-base font-medium text-paper hover:text-signal">
                  {gig.title}
                </Link>
                {gig.assignedFreelancer && (
                  <p className="mt-1 text-xs text-graphite-dark">Working with {gig.assignedFreelancer.name}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {gig.status === 'open' && (
                  <Link to={`/gigs/${gig._id}/edit`}>
                    <Button variant="secondaryDark" size="sm">
                      Edit
                    </Button>
                  </Link>
                )}
                <Link to={`/gigs/${gig._id}`}>
                  <Button variant="ghostDark" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MyGigs;
