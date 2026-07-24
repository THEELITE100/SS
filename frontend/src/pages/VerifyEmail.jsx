import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { authApi } from '../features/auth/authApi';

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <Card className="w-full max-w-md p-8 text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-signal" />
            <p className="mt-4 text-graphite">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-9 w-9 text-success" />
            <h1 className="mt-4 text-xl font-medium text-ink">Email verified</h1>
            <p className="mt-2 text-sm text-graphite">Your account is now fully active.</p>
            <Link to="/dashboard">
              <Button className="mt-6 w-full">Go to dashboard</Button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-9 w-9 text-danger" />
            <h1 className="mt-4 text-xl font-medium text-ink">Verification failed</h1>
            <p className="mt-2 text-sm text-graphite">This link is invalid or has expired.</p>
            <Link to="/dashboard">
              <Button variant="secondary" className="mt-6 w-full">
                Go to dashboard
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

export default VerifyEmail;
