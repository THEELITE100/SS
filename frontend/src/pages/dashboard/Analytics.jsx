import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, DollarSign, Briefcase, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useMyAnalytics } from '../../features/profiles/useProfiles';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card dark className="p-6">
      <div className="flex items-center gap-2 text-graphite-dark">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 font-mono text-2xl text-paper">{value}</p>
      {sub && <p className="mt-1 text-xs text-graphite-dark">{sub}</p>}
    </Card>
  );
}

function monthLabel(monthStr) {
  const [year, month] = monthStr.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, { month: 'short' });
}

function Analytics() {
  const { data, isLoading, isError } = useMyAnalytics();

  if (isLoading) return <p className="text-graphite-dark">Loading analytics...</p>;
  if (isError || !data) {
    return (
      <Card dark className="p-6">
        <p className="text-sm text-graphite-dark">Couldn&apos;t load analytics — needs a connected database.</p>
      </Card>
    );
  }

  const chartData = data.monthlyRevenue.map((m) => ({ month: monthLabel(m.month), amount: m.amount }));
  const acceptanceRate =
    data.totalProposals > 0 ? Math.round(((data.proposalsByStatus.accepted || 0) / data.totalProposals) * 100) : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-paper">Your analytics</h1>
      <p className="mt-1 text-graphite-dark">How your profile and proposals are performing.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Eye} label="Profile views" value={data.profileViews} />
        <StatCard icon={DollarSign} label="Total earnings" value={`$${data.totalEarnings.toLocaleString()}`} />
        <StatCard icon={Briefcase} label="Completed gigs" value={data.completedGigs} />
        <StatCard
          icon={Star}
          label="Reputation"
          value={data.totalReviews > 0 ? data.reputationScore.toFixed(1) : 'New'}
          sub={`${data.totalReviews} review${data.totalReviews === 1 ? '' : 's'}`}
        />
      </div>

      <Card dark className="mt-6 p-6">
        <h2 className="text-sm font-medium text-paper">Monthly revenue</h2>
        <div className="mt-4 h-64">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-graphite-dark">
              No released payments yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26292E" vertical={false} />
                <XAxis dataKey="month" stroke="#9A9DA3" fontSize={12} />
                <YAxis stroke="#9A9DA3" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#17191D', border: '1px solid #26292E', borderRadius: 8, fontSize: 13 }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="amount" fill="#1F5FE0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card dark className="mt-6 p-6">
        <h2 className="text-sm font-medium text-paper">Proposals</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="font-mono text-xl text-paper">{data.totalProposals}</p>
            <p className="text-xs text-graphite-dark">Total sent</p>
          </div>
          <div>
            <p className="font-mono text-xl text-paper">{data.proposalsByStatus.accepted || 0}</p>
            <p className="text-xs text-graphite-dark">Accepted</p>
          </div>
          <div>
            <p className="font-mono text-xl text-paper">{data.proposalsByStatus.pending || 0}</p>
            <p className="text-xs text-graphite-dark">Pending</p>
          </div>
          <div>
            <p className="font-mono text-xl text-paper">{acceptanceRate !== null ? `${acceptanceRate}%` : '—'}</p>
            <p className="text-xs text-graphite-dark">Acceptance rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Analytics;
