import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { setCredentials } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { setAccessToken } from '../api/axiosInstance';

function OAuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(hash);
    const accessToken = params.get('accessToken');

    if (!accessToken) {
      navigate('/login?error=google_auth_failed');
      return;
    }

    setAccessToken(accessToken);

    authApi
      .getMe()
      .then(({ data }) => {
        dispatch(setCredentials({ user: data.data.user, accessToken }));
        navigate('/dashboard');
      })
      .catch(() => navigate('/login?error=google_auth_failed'));
  }, [dispatch, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Loader2 className="h-9 w-9 animate-spin text-signal" />
    </div>
  );
}

export default OAuthCallback;
