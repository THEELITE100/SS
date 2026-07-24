import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { loginUser, verifyLogin2FA } from '../features/auth/authSlice';

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2">
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12.5" stroke="#1F5FE0" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="7" stroke="#1F5FE0" strokeWidth="1.5" strokeDasharray="2 2.5" />
        <circle cx="14" cy="3.5" r="2" fill="#1F5FE0" />
      </svg>
      <span className="font-display text-lg font-medium text-ink">SkillSphere</span>
    </Link>
  );
}

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [code, setCode] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, twoFactorChallenge } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result) && !result.payload.twoFactorRequired) {
      navigate('/dashboard');
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyLogin2FA({ challengeToken: twoFactorChallenge, code }));
    if (verifyLogin2FA.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Logo />
          <h1 className="mt-6 text-2xl font-medium text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-graphite">Log in to continue to your dashboard.</p>
        </div>

        <Card className="p-8">
          {twoFactorChallenge ? (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="mb-2 flex items-center gap-2 text-ink">
                <ShieldCheck className="h-5 w-5 text-signal" />
                <span className="text-sm font-medium">Enter your 6-digit authentication code</span>
              </div>
              <Input
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                inputMode="numeric"
                required
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Verify
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs text-graphite hover:text-signal">
                    Forgot password?
                  </Link>
                </div>
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Log in
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-xs text-graphite">OR</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <a href={`${apiUrl}/auth/google`}>
                <Button variant="secondary" className="w-full" type="button">
                  Continue with Google
                </Button>
              </a>

              <p className="mt-6 text-center text-sm text-graphite">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-medium text-signal hover:underline">
                  Sign up
                </Link>
              </p>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default Login;
