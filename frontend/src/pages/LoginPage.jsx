// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import { loginUser, clearError } from '../store/slices/authSlice';
// import Input from '../components/common/Input';
// import Button from '../components/common/Button';
// import GlassCard from '../components/common/GlassCard';

// const LoginPage = () => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

//   useEffect(() => {
//     dispatch(clearError());
//   }, [dispatch]);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       if (user.role === 'admin') navigate('/admin/dashboard');
//       else if (user.role === 'freelancer') navigate('/freelancer/dashboard');
//       else navigate('/gigs'); 
//     }
//   }, [isAuthenticated, user, navigate]);

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     dispatch(loginUser(formData));
//   };

//   return (
//     <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gradient-to-b from-premium-light to-white px-4 py-12">
//       <div className="w-full max-w-md animate-fade-in">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-extrabold tracking-tight text-premium-dark">
//             Welcome back
//           </h1>
//           <p className="text-sm text-gray-500 mt-2">
//             Enter your credentials to access your SkillSphere workspace.
//           </p>
//         </div>

//         <GlassCard className="!p-8 shadow-2xl border-gray-200/80">
//           {error && (
//             <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
//               <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <span>{error}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//             <Input
//               id="email"
//               label="Email Address"
//               type="email"
//               placeholder="name@example.com"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />

//             <div className="flex flex-col gap-1">
//               <Input
//                 id="password"
//                 label="Password"
//                 type="password"
//                 placeholder="••••••••"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//               <div className="flex justify-end">
//                 <a href="#forgot" className="text-xs font-medium text-premium-accent hover:underline">
//                   Forgot password?
//                 </a>
//               </div>
//             </div>

//             <Button
//               type="submit"
//               variant="primary"
//               size="md"
//               fullWidth
//               disabled={isLoading}
//               className="mt-2 py-3"
//             >
//               {isLoading ? (
//                 <span className="flex items-center gap-2">
//                   <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                   </svg>
//                   Signing in...
//                 </span>
//               ) : (
//                 'Sign In'
//               )}
//             </Button>
//           </form>
//         </GlassCard>

//         <p className="text-center text-xs text-gray-500 mt-6">
//           Don't have an account yet?{' '}
//           <Link to="/register" className="font-semibold text-premium-dark hover:underline">
//             Create an account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import GlassCard from '../components/common/GlassCard';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSuccessfulAuth = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    alert(`Welcome back, ${userData.name || 'User'}!`);
    navigate('/gigs');
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      setIsLoading(false);
      handleSuccessfulAuth(res.data.user || res.data, res.data.token || 'mock_jwt_token');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  const handleDemoLogin = (role) => {
    const mockUser = {
      _id: role === 'client' ? 'client_demo_101' : 'freelancer_demo_202',
      name: role === 'client' ? 'TechHub Enterprise (Client Demo)' : 'Aarav Sharma (Freelancer Demo)',
      email: role === 'client' ? 'client@skillsphere.io' : 'freelancer@skillsphere.io',
      role: role,
    };
    handleSuccessfulAuth(mockUser, `demo_jwt_token_${role}`);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md !p-8 border-gray-200/80 shadow-2xl flex flex-col gap-6 animate-fade-in">
        
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">Access Ecosystem</span>
          <h1 className="text-2xl font-black text-premium-dark mt-1">Sign In to SkillSphere</h1>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col gap-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 text-center">
            ⚡ Instant Sandbox Testing (Skip Password)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('client')} className="!bg-white">
              Login as Client
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('freelancer')} className="!bg-white">
              Login as Freelancer
            </Button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-3 text-gray-400 text-xs font-bold uppercase">Or use credentials</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="client@skillsphere.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" variant="primary" size="md" fullWidth disabled={isLoading} className="mt-2">
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 font-medium">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-black hover:underline">
            Create Account
          </Link>
        </p>

      </GlassCard>
    </div>
  );
};

export default LoginPage;