import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { authApi } from '../features/auth/authApi';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="12.5" stroke="#1F5FE0" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="7" stroke="#1F5FE0" strokeWidth="1.5" strokeDasharray="2 2.5" />
              <circle cx="14" cy="3.5" r="2" fill="#1F5FE0" />
            </svg>
            <span className="font-display text-lg font-medium text-ink">SkillSphere</span>
          </Link>
          <h1 className="mt-6 text-2xl font-medium text-ink">Reset your password</h1>
          <p className="mt-2 text-sm text-graphite">We&apos;ll email you a secure reset link.</p>
        </div>

        <Card className="p-8">
          {sent ? (
            <p className="text-center text-sm text-graphite">
              If an account exists for <span className="text-ink">{email}</span>, a reset link is on its way.
              Check your inbox (and spam folder).
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Send reset link
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-graphite">
            <Link to="/login" className="font-medium text-signal hover:underline">
              Back to login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;
