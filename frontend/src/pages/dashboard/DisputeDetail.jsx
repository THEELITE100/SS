import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useDispute, useAddDisputeMessage } from '../../features/disputes/useDisputes';

const OUTCOME_LABEL = {
  pay_freelancer: 'Resolved in favor of the freelancer',
  refund_client: 'Resolved in favor of the client (refunded)',
  no_action: 'No action taken',
};

function DisputeDetail() {
  const { id } = useParams();
  const { data: dispute, isLoading, isError } = useDispute(id);
  const addMessage = useAddDisputeMessage(id);
  const [draft, setDraft] = useState('');

  if (isLoading) return <p className="text-graphite-dark">Loading...</p>;
  if (isError || !dispute) {
    return (
      <Card dark className="p-6">
        <p className="text-sm text-graphite-dark">Couldn&apos;t load this dispute.</p>
      </Card>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    addMessage.mutate(draft.trim());
    setDraft('');
  };

  const isClosed = ['resolved', 'rejected'].includes(dispute.status);

  return (
    <div>
      <Link to="/dashboard/disputes" className="mb-6 inline-flex items-center gap-1.5 text-sm text-graphite-dark hover:text-paper">
        <ArrowLeft className="h-4 w-4" /> Back to disputes
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-medium text-paper">{dispute.reason}</h1>
        <Badge status={dispute.status} />
      </div>
      <p className="mt-1 text-sm text-graphite-dark">
        On{' '}
        <Link to={`/gigs/${dispute.gig?._id}`} className="text-signal hover:underline">
          {dispute.gig?.title}
        </Link>{' '}
        · Between {dispute.raisedBy?.name} and {dispute.against?.name}
      </p>

      <Card dark className="mt-6 p-6">
        <p className="text-sm text-graphite-dark">{dispute.description}</p>
      </Card>

      {isClosed && (
        <Card dark className="mt-4 flex items-start gap-3 border-signal/40 p-6">
          {dispute.status === 'resolved' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-graphite-dark" />
          )}
          <div>
            <p className="text-sm font-medium text-paper">{OUTCOME_LABEL[dispute.outcome] || 'Closed'}</p>
            <p className="mt-1 text-sm text-graphite-dark">{dispute.resolution}</p>
            <p className="mt-1 text-xs text-graphite-dark/70">Resolved by {dispute.resolvedBy?.name}</p>
          </div>
        </Card>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-medium text-paper">Messages</h2>
        <div className="mt-3 space-y-3">
          {dispute.messages?.map((msg, i) => (
            <div key={i} className="rounded-lg border border-ink-line p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-signal/20 text-[10px] font-medium text-signal">
                  {msg.by?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs font-medium text-paper">{msg.by?.name}</span>
                <span className="text-xs text-graphite-dark">{new Date(msg.at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-graphite-dark">{msg.message}</p>
            </div>
          ))}
          {dispute.messages?.length === 0 && <p className="text-sm text-graphite-dark">No messages yet.</p>}
        </div>

        {!isClosed && (
          <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a message or evidence description..."
              className="flex-1 rounded-lg border border-ink-line bg-ink px-4 py-2.5 text-sm text-paper placeholder:text-graphite-dark focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
            />
            <Button type="submit" disabled={!draft.trim()} isLoading={addMessage.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default DisputeDetail;
