import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../common/Button';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.auth || {});
  const isLoggedIn = Boolean(userInfo || sessionStorage.getItem('token'));

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userInfo');
    if (dispatch && { type: 'auth/logout' }) {
      dispatch({ type: 'auth/logout' });
    }
    alert('Logged out successfully.');
    navigate('/login');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="text-xl font-black tracking-tight text-premium-dark">
            Skill<span className="text-blue-600">Sphere</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/gigs" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">
            Explore Gigs
          </Link>
          <Link to="/freelancers" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">
            Talent
          </Link>
          {isLoggedIn && (
            <>
              <Link to="/client/proposals" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">
                Proposals
              </Link>
              <Link to="/freelancer/edit-profile" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">
                Edit Profile
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn && <NotificationDropdown />}

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/freelancer/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;