import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, UserCheck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { registerUser } from '../features/auth/authSlice';

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

function Register() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: searchParams.get('role') === 'freelancer' ? 'freelancer' : 'client',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const isLoading = status === 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
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
          <h1 className="mt-6 text-2xl font-medium text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-graphite">Join as a client or freelancer — free, always.</p>
        </div>

        <Card className="p-8">
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'client' })}
              className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-colors ${
                form.role === 'client' ? 'border-signal bg-signal-soft' : 'border-line bg-paper'
              }`}
            >
              <Briefcase className={`h-5 w-5 ${form.role === 'client' ? 'text-signal' : 'text-graphite'}`} />
              <span className="text-sm font-medium text-ink">I'm hiring</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'freelancer' })}
              className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-colors ${
                form.role === 'freelancer' ? 'border-signal bg-signal-soft' : 'border-line bg-paper'
              }`}
            >
              <UserCheck className={`h-5 w-5 ${form.role === 'freelancer' ? 'text-signal' : 'text-graphite'}`} />
              <span className="text-sm font-medium text-ink">I'm freelancing</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              icon={User}
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
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
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create account
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
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-signal hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

export default Register;
