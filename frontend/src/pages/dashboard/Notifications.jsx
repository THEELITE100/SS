import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Briefcase, MessageSquare, Wallet, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../features/notifications/useNotifications';

const ICONS = {
  proposal_received: Briefcase,
  proposal_accepted: Briefcase,
  proposal_rejected: Briefcase,
  milestone_submitted: Briefcase,
  milestone_approved: Wallet,
  payment_received: Wallet,
  payment_released: Wallet,
  review_added: Star,
  message_received: MessageSquare,
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Notifications() {
  const { data, isLoading, isError } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-paper">Notifications</h1>
          <p className="mt-1 text-graphite-dark">
            {data?.unreadCount > 0 ? `${data.unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {data?.unreadCount > 0 && (
          <Button variant="secondaryDark" size="sm" onClick={() => markAllRead.mutate()} isLoading={markAllRead.isPending}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="mt-8 space-y-2">
        {isLoading && <p className="text-graphite-dark">Loading...</p>}

        {isError && (
          <Card dark className="p-6">
            <p className="text-sm text-graphite-dark">
              Couldn&apos;t load notifications — this needs a connected database, covered in the README.
            </p>
          </Card>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <Card dark className="p-10 text-center">
            <Bell className="mx-auto h-8 w-8 text-graphite-dark" />
            <p className="mt-3 text-graphite-dark">Nothing here yet.</p>
          </Card>
        )}

        {notifications.map((n) => {
          const Icon = ICONS[n.type] || Bell;
          const content = (
            <Card dark className={`flex items-start gap-4 p-4 transition-colors ${!n.isRead ? 'border-signal/40' : ''}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal-soft">
                <Icon className="h-4 w-4 text-signal" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-paper">{n.title}</p>
                  {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />}
                </div>
                <p className="mt-0.5 text-sm text-graphite-dark">{n.message}</p>
                <p className="mt-1 text-xs text-graphite-dark/70">{timeAgo(n.createdAt)}</p>
              </div>
            </Card>
          );

          return (
            <div key={n._id} onClick={() => !n.isRead && markRead.mutate(n._id)}>
              {n.link ? <Link to={n.link}>{content}</Link> : content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Notifications;
