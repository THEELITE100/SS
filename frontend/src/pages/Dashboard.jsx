import { useSelector } from 'react-redux';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { LayoutGrid, Briefcase, Send, MessageSquare, Star, Settings, Bell, UserCircle, Sparkles, AlertTriangle, BarChart3 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MyGigs from './dashboard/MyGigs';
import MyProposals from './dashboard/MyProposals';
import Messages from './dashboard/Messages';
import Notifications from './dashboard/Notifications';
import Disputes from './dashboard/Disputes';
import DisputeDetail from './dashboard/DisputeDetail';
import Analytics from './dashboard/Analytics';
import ProfileEdit from './profile/ProfileEdit';
import { useNotifications } from '../features/notifications/useNotifications';
import { useRecommendedGigs } from '../features/matching/useMatching';

function RecommendedGigs() {
  const { data, isLoading } = useRecommendedGigs();
  const recommendations = data?.recommendations || [];

  if (isLoading || recommendations.length === 0) return null;

  return (
    <Card dark className="mt-6 p-6">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-paper">
        <Sparkles className="h-4 w-4 text-signal" />
        Recommended for you
      </h2>
      <div className="mt-4 space-y-3">
        {recommendations.slice(0, 5).map(({ gig, score }) => (
          <Link
            key={gig._id}
            to={`/gigs/${gig._id}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-ink-line p-3 transition-colors hover:border-signal/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-paper">{gig.title}</p>
              <p className="text-xs text-graphite-dark">
                {gig.currency} {gig.budgetMin?.toLocaleString()}–{gig.budgetMax?.toLocaleString()}
              </p>
            </div>
            <Badge tone="signal">{Math.round(score * 100)}% match</Badge>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function DashboardHome() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-paper">
        Welcome back, {user?.name?.split(' ')[0]}
      </h1>
      <p className="mt-1 text-graphite-dark">
        Your {user?.role} dashboard. Email verified:{' '}
        <span className={user?.isEmailVerified ? 'text-success' : 'text-verified'}>
          {user?.isEmailVerified ? 'Yes' : 'Pending'}
        </span>
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card dark className="p-6">
          <p className="text-sm text-graphite-dark">Account role</p>
          <p className="mt-1 font-mono text-xl text-paper capitalize">{user?.role}</p>
        </Card>
        <Card dark className="p-6">
          <p className="text-sm text-graphite-dark">2FA status</p>
          <p className="mt-1 font-mono text-xl text-paper">
            {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </p>
        </Card>
        <Card dark className="p-6">
          <p className="text-sm text-graphite-dark">Member since</p>
          <p className="mt-1 font-mono text-xl text-paper">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </p>
        </Card>
      </div>

      {user?.role === 'freelancer' && <RecommendedGigs />}

      <Card dark className="mt-8 p-6">
        <p className="text-sm leading-relaxed text-graphite-dark">
          {user?.role === 'client'
            ? 'Post a gig, review proposals as they come in, fund milestones, message your freelancer, and leave a review once it wraps up — all from the tabs on the left.'
            : 'Browse open gigs, submit proposals, and once you land one, message your client, get paid per milestone, and build your reputation with verified reviews — all from the tabs on the left.'}
        </p>
      </Card>
    </div>
  );
}

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data: notificationData } = useNotifications();
  const isClient = user?.role === 'client';
  const unreadCount = notificationData?.unreadCount || 0;

  const navItems = [
    { to: '/dashboard', end: true, icon: LayoutGrid, label: 'Overview' },
    ...(isClient ? [{ to: '/dashboard/gigs', icon: Briefcase, label: 'Gigs' }] : []),
    ...(!isClient ? [{ to: '/dashboard/proposals', icon: Send, label: 'Proposals' }] : []),
    ...(!isClient ? [{ to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' }] : []),
    { to: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { to: '/dashboard/disputes', icon: AlertTriangle, label: 'Disputes' },
    { to: '/dashboard/profile', icon: UserCircle, label: 'Profile' },
    isClient
      ? { to: '/dashboard/reviews', icon: Star, label: 'Reviews', disabled: true }
      : { to: `/freelancers/${user?._id}`, icon: Star, label: 'Reviews' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings', disabled: true },
  ];

  return (
    <div className="flex min-h-screen bg-ink">
      <aside className="hidden w-64 flex-col border-r border-ink-line p-6 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="12.5" stroke="#1F5FE0" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="7" stroke="#1F5FE0" strokeWidth="1.5" strokeDasharray="2 2.5" />
            <circle cx="14" cy="3.5" r="2" fill="#1F5FE0" />
          </svg>
          <span className="font-display text-lg font-medium text-paper">SkillSphere</span>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) =>
            item.disabled ? (
              <span
                key={item.label}
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-graphite-dark/50"
                title="Coming in a later phase"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive ? 'bg-signal/15 text-signal' : 'text-graphite-dark hover:bg-white/5 hover:text-paper'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1.5 text-[11px] font-medium text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </NavLink>
            )
          )}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-lg border border-ink-line bg-ink-raised p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-signal/20 text-sm font-medium text-signal">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-paper">{user?.name}</p>
            <p className="truncate text-xs text-graphite-dark">{user?.email}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <Routes>
          <Route index element={<DashboardHome />} />
          {isClient && <Route path="gigs" element={<MyGigs />} />}
          {!isClient && <Route path="proposals" element={<MyProposals />} />}
          {!isClient && <Route path="analytics" element={<Analytics />} />}
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="disputes" element={<Disputes />} />
          <Route path="disputes/:id" element={<DisputeDetail />} />
          <Route path="profile" element={<ProfileEdit />} />
        </Routes>
      </main>
    </div>
  );
}

export default Dashboard;
