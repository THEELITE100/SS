import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import { logoutUser } from '../../features/auth/authSlice';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12.5" stroke="#1F5FE0" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="7" stroke="#1F5FE0" strokeWidth="1.5" strokeDasharray="2 2.5" />
        <circle cx="14" cy="3.5" r="2" fill="#1F5FE0" />
      </svg>
      <span className="font-display text-lg font-medium tracking-tight text-ink">SkillSphere</span>
    </Link>
  );
}

function Navbar() {
  const { status, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/85 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/gigs" className="text-sm text-graphite transition-colors hover:text-ink">
            Browse gigs
          </Link>
          <a href="#how-it-works" className="text-sm text-graphite transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#trust" className="text-sm text-graphite transition-colors hover:text-ink">
            Trust &amp; safety
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {status === 'authenticated' ? (
            <>
              <span className="text-sm text-graphite">Hi, {user?.name?.split(' ')[0]}</span>
              {user?.role === 'admin' && (
                <Button variant="secondary" size="sm" onClick={() => navigate('/admin')}>
                  Admin
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6 text-ink" /> : <Menu className="h-6 w-6 text-ink" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-line px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/gigs" className="py-1.5 text-sm text-graphite" onClick={() => setMobileOpen(false)}>
              Browse gigs
            </Link>
            {status === 'authenticated' ? (
              <>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button variant="primary" onClick={() => navigate('/register')}>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
