import { useSelector } from 'react-redux';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { LayoutGrid, Users, Briefcase, ShieldAlert, AlertTriangle } from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminGigs from './AdminGigs';
import AdminReviews from './AdminReviews';
import AdminDisputes from './AdminDisputes';

const navItems = [
  { to: '/admin', end: true, icon: LayoutGrid, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/gigs', icon: Briefcase, label: 'Gigs' },
  { to: '/admin/reviews', icon: ShieldAlert, label: 'Flagged reviews' },
  { to: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
];

function AdminLayout() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen bg-ink">
      <aside className="hidden w-64 flex-col border-r border-ink-line p-6 lg:flex">
        <Link to="/" className="mb-2 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="12.5" stroke="#1F5FE0" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="7" stroke="#1F5FE0" strokeWidth="1.5" strokeDasharray="2 2.5" />
            <circle cx="14" cy="3.5" r="2" fill="#1F5FE0" />
          </svg>
          <span className="font-display text-lg font-medium text-paper">SkillSphere</span>
        </Link>
        <p className="mb-6 text-xs uppercase tracking-wide text-graphite-dark">Admin</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
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
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-lg border border-ink-line bg-ink-raised p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-signal/20 text-sm font-medium text-signal">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-paper">{user?.name}</p>
            <p className="truncate text-xs text-graphite-dark">Administrator</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="gigs" element={<AdminGigs />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="disputes" element={<AdminDisputes />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminLayout;
