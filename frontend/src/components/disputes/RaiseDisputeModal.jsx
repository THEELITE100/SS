import { useState } from 'react';
import { X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useCreateDispute } from '../../features/disputes/useDisputes';

function RaiseDisputeModal({ gigId, milestoneId, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const createDispute = useCreateDispute(gigId);

  const handleSubmit = (e) => {
    e.preventDefault();
    createDispute.mutate({ reason, description, milestoneId: milestoneId || undefined }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-medium text-ink">Report an issue</h3>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-graphite" />
          </button>
        </div>
        <p className="mb-4 text-sm text-graphite">
          This notifies the other party and puts an admin in the loop. Use it if something can&apos;t be worked
          out directly.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reason"
            required
            maxLength={200}
            placeholder="e.g. Work doesn't match what was agreed"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-graphite">What happened?</label>
            <textarea
              required
              rows={4}
              maxLength={3000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper-raised px-4 py-2.5 text-sm text-ink placeholder:text-graphite/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
            />
          </div>
          <Button type="submit" className="w-full" isLoading={createDispute.isPending}>
            Submit dispute
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default RaiseDisputeModal;
