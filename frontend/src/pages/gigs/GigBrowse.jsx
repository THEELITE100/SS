import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { CATEGORIES } from '../../constants/categories';
import { useGigs } from '../../features/gigs/useGigs';
import { useTrendingSkills } from '../../features/matching/useMatching';

function formatBudget(gig) {
  const min = gig.budgetMin?.toLocaleString();
  const max = gig.budgetMax?.toLocaleString();
  const unit = gig.budgetType === 'hourly' ? '/hr' : '';
  return `${gig.currency} ${min}–${max}${unit}`;
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function GigBrowse() {
  const [searchDraft, setSearchDraft] = useState('');
  const [filters, setFilters] = useState({ page: 1, limit: 12 });

  const { data, isLoading, isError } = useGigs(filters);
  const { data: trending } = useTrendingSkills();

  const updateFilter = (patch) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter({ search: searchDraft || undefined });
  };

  const handleTrendingClick = (skill) => {
    setSearchDraft(skill);
    updateFilter({ search: skill });
  };

  const gigs = data?.gigs || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="border-b border-line px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Find your next project
          </h1>
          <p className="mt-2 text-graphite">Browse open gigs, filtered by skill, budget, and location.</p>

          <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-3">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Search by title, description, or skill..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </section>

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
          {/* Filters */}
          <aside className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-ink">Category</h3>
              <div className="mt-3 space-y-1.5">
                <button
                  onClick={() => updateFilter({ category: undefined })}
                  className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                    !filters.category ? 'bg-signal-soft text-signal' : 'text-graphite hover:bg-line/50'
                  }`}
                >
                  All categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter({ category: cat })}
                    className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                      filters.category === cat ? 'bg-signal-soft text-signal' : 'text-graphite hover:bg-line/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-ink">Location</h3>
              <div className="mt-3 space-y-1.5">
                <button
                  onClick={() => updateFilter({ isRemote: undefined })}
                  className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                    filters.isRemote === undefined ? 'bg-signal-soft text-signal' : 'text-graphite hover:bg-line/50'
                  }`}
                >
                  Any
                </button>
                <button
                  onClick={() => updateFilter({ isRemote: 'true' })}
                  className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                    filters.isRemote === 'true' ? 'bg-signal-soft text-signal' : 'text-graphite hover:bg-line/50'
                  }`}
                >
                  Remote only
                </button>
                <button
                  onClick={() => updateFilter({ isRemote: 'false' })}
                  className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                    filters.isRemote === 'false' ? 'bg-signal-soft text-signal' : 'text-graphite hover:bg-line/50'
                  }`}
                >
                  On-site only
                </button>
              </div>
            </div>

            {trending?.length > 0 && (
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-medium text-ink">
                  <TrendingUp className="h-3.5 w-3.5 text-signal" />
                  Trending skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {trending.map((t) => (
                    <button
                      key={t.skill}
                      onClick={() => handleTrendingClick(t.skill)}
                      className="rounded-md bg-line/60 px-2 py-1 text-xs font-medium capitalize text-graphite transition-colors hover:bg-signal-soft hover:text-signal"
                    >
                      {t.skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Results */}
          <div>
            {isLoading && (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-signal" />
              </div>
            )}

            {isError && (
              <Card className="p-8 text-center">
                <p className="text-graphite">
                  Couldn&apos;t load gigs right now — this page needs a connected database. Once your MongoDB
                  Atlas URI is set in <code className="font-mono text-xs">backend/.env</code>, this list populates
                  live.
                </p>
              </Card>
            )}

            {!isLoading && !isError && gigs.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-graphite">No open gigs match those filters yet.</p>
              </Card>
            )}

            <div className="space-y-4">
              {gigs.map((gig) => (
                <Link key={gig._id} to={`/gigs/${gig._id}`}>
                  <Card className="p-6 transition-colors hover:border-signal/40">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge status={gig.status} />
                          <span className="text-xs text-graphite">{gig.category}</span>
                        </div>
                        <h3 className="mt-2 truncate text-lg font-medium text-ink">{gig.title}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm text-graphite">{gig.description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-graphite">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {gig.location?.isRemote ? 'Remote' : gig.location?.city || 'On-site'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {timeAgo(gig.createdAt)}
                          </span>
                          <span>{gig.applicationsCount || 0} proposals</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-mono text-base font-medium text-ink">{formatBudget(gig)}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-graphite">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default GigBrowse;
