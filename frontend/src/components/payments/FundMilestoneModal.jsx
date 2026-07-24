import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useFundMilestone, useConfirmPayment } from '../../features/payments/usePayments';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function PaymentForm({ payment, gigId, onClose, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const confirmPayment = useConfirmPayment(gigId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      await confirmPayment.mutateAsync(payment._id);
      onSuccess();
      return;
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1" isLoading={isProcessing || confirmPayment.isPending} disabled={!stripe}>
          Pay {payment.currency} {payment.amount}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
      <p className="text-center text-xs text-graphite">
        Test mode — card 4242 4242 4242 4242, any future date, any CVC.
      </p>
    </form>
  );
}

function FundMilestoneModal({ gigId, milestoneId, onClose, onSuccess }) {
  const fundMilestone = useFundMilestone(gigId);
  const [intentData, setIntentData] = useState(null);

  useEffect(() => {
    fundMilestone.mutate(milestoneId, {
      onSuccess: (data) => setIntentData(data),
    });
    // Runs once per milestone — intentionally excludes the mutation object,
    // which changes identity every render and would otherwise re-fire this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-medium text-ink">Fund milestone</h3>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-graphite" />
          </button>
        </div>

        {!stripePromise && (
          <p className="text-sm text-graphite">
            Payments aren&apos;t configured yet. Add your Stripe test keys to both .env files — see the README.
          </p>
        )}

        {stripePromise && fundMilestone.isPending && <p className="text-sm text-graphite">Setting up payment...</p>}

        {stripePromise && fundMilestone.isError && (
          <p className="text-sm text-danger">Couldn&apos;t start this payment. Check the backend logs and try again.</p>
        )}

        {stripePromise && intentData?.clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret: intentData.clientSecret }}>
            <PaymentForm payment={intentData.payment} gigId={gigId} onClose={onClose} onSuccess={onSuccess} />
          </Elements>
        )}
      </Card>
    </div>
  );
}

export default FundMilestoneModal;
