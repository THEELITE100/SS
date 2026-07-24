import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { authApi } from '../features/auth/authApi';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'That reset link may have expired.');
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
          <h1 className="mt-6 text-2xl font-medium text-ink">Set a new password</h1>
        </div>
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New password"
              type="password"
              icon={Lock}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Reset password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default ResetPassword;
