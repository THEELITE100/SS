import { useState } from 'react';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAdminUsers, useSuspendUser, useUnsuspendUser, useVerifyFreelancer } from '../../features/admin/useAdmin';

function AdminUsers() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const { data, isLoading, isError } = useAdminUsers({ search: search || undefined, role: role || undefined });
  const suspendUser = useSuspendUser();
  const unsuspendUser = useUnsuspendUser();
  const verifyFreelancer = useVerifyFreelancer();

  const users = data?.users || [];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-paper">Users</h1>
      <p className="mt-1 text-graphite-dark">{data?.pagination?.total || 0} total accounts</p>

      <div className="mt-6 flex gap-3">
        <div className="max-w-xs flex-1">
          <Input
            icon={Search}
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-ink-line bg-ink-raised text-paper placeholder:text-graphite-dark"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-ink-line bg-ink-raised px-4 py-2.5 text-sm text-paper focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
        >
          <option value="">All roles</option>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-graphite-dark">Loading...</p>}
        {isError && (
          <Card dark className="p-6">
            <p className="text-sm text-graphite-dark">Couldn&apos;t load users — needs a connected database.</p>
          </Card>
        )}

        {users.map((u) => (
          <Card key={u._id} dark className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal/20 text-sm font-medium text-signal">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-paper">{u.name}</p>
                  <Badge tone="neutral" className="bg-white/5 text-graphite-dark">
                    {u.role}
                  </Badge>
                  {u.isSuspended && <Badge tone="danger">Suspended</Badge>}
                </div>
                <p className="text-xs text-graphite-dark">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {u.role === 'freelancer' && (
                <Button variant="secondaryDark" size="sm" onClick={() => verifyFreelancer.mutate({ id: u._id, badge: 'verified' })}>
                  <ShieldCheck className="h-4 w-4" /> Verify
                </Button>
              )}
              {u.role !== 'admin' &&
                (u.isSuspended ? (
                  <Button variant="secondaryDark" size="sm" onClick={() => unsuspendUser.mutate(u._id)}>
                    Unsuspend
                  </Button>
                ) : (
                  <Button
                    variant="secondaryDark"
                    size="sm"
                    onClick={() => {
                      const reason = window.prompt('Reason for suspension?') || '';
                      suspendUser.mutate({ id: u._id, reason });
                    }}
                  >
                    <ShieldOff className="h-4 w-4" /> Suspend
                  </Button>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdminUsers;
