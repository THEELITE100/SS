import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAdminAnalytics } from '../../features/admin/useAdmin';

const STATUS_COLORS = {
  open: '#1F5FE0',
  in_progress: '#B8863B',
  completed: '#1F8A5C',
  cancelled: '#6B6F76',
};

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

function AdminOverview() {
  const { data, isLoading, isError } = useAdminAnalytics();

  if (isLoading) return <p className="text-graphite-dark">Loading analytics...</p>;

  if (isError) {
    return (
      <Card dark className="p-6">
        <p className="text-sm text-graphite-dark">
          Couldn&apos;t load analytics — this needs a connected database, covered in the README.
        </p>
      </Card>
    );
  }

  const gigStatusData = Object.entries(data.gigsByStatus || {}).map(([status, count]) => ({ status, count }));

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-paper">Platform overview</h1>
      <p className="mt-1 text-graphite-dark">Revenue, activity, and job outcomes across SkillSphere.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Platform revenue"
          value={`$${data.platformRevenue?.toLocaleString() || 0}`}
          sub={`${data.releasedPaymentsCount} released payments`}
        />
        <StatCard icon={Users} label="Active freelancers" value={data.activeFreelancers} sub={`${data.totalUsers} total users`} />
        <StatCard
          icon={CheckCircle2}
          label="Job success rate"
          value={data.jobSuccessRate !== null ? `${data.jobSuccessRate}%` : '—'}
          sub="Completed vs. cancelled"
        />
        <StatCard icon={TrendingUp} label="Top category" value={data.topCategories?.[0]?.category || '—'} sub={`${data.topCategories?.[0]?.count || 0} gigs`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card dark className="p-6">
          <h2 className="text-sm font-medium text-paper">Top categories</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCategories} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26292E" horizontal={false} />
                <XAxis type="number" stroke="#9A9DA3" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="category" stroke="#9A9DA3" fontSize={12} width={110} />
                <Tooltip contentStyle={{ background: '#17191D', border: '1px solid #26292E', borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="count" fill="#1F5FE0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card dark className="p-6">
          <h2 className="text-sm font-medium text-paper">Gigs by status</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gigStatusData} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {gigStatusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6B6F76'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#17191D', border: '1px solid #26292E', borderRadius: 8, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            {gigStatusData.map((entry) => (
              <span key={entry.status} className="flex items-center gap-1.5 text-xs text-graphite-dark">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[entry.status] || '#6B6F76' }} />
                {entry.status} ({entry.count})
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminOverview;
