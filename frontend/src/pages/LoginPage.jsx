// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import apiClient from '../utils/apiClient';
// import Input from '../components/common/Input';
// import Button from '../components/common/Button';
// import GlassCard from '../components/common/GlassCard';

// const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   const handleSuccessfulAuth = (userData, token) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('userInfo', JSON.stringify(userData));
//     alert(`Welcome back, ${userData.name || 'User'}!`);
//     navigate('/gigs');
//     window.location.reload();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     try {
//       const res = await apiClient.post('/auth/login', { email, password });
//       setIsLoading(false);
//       handleSuccessfulAuth(res.data.user || res.data, res.data.token || 'mock_jwt_token');
//     } catch (err) {
//       setIsLoading(false);
//       setError(err.response?.data?.message || 'Invalid email or password.');
//     }
//   };

//   const handleDemoLogin = (role) => {
//     const mockUser = {
//       _id: role === 'client' ? 'client_demo_101' : 'freelancer_demo_202',
//       name: role === 'client' ? 'TechHub Enterprise (Client Demo)' : 'Aarav Sharma (Freelancer Demo)',
//       email: role === 'client' ? 'client@skillsphere.io' : 'freelancer@skillsphere.io',
//       role: role,
//     };
//     handleSuccessfulAuth(mockUser, `demo_jwt_token_${role}`);
//   };

//   return (
//     <div className="min-h-[calc(100vh-72px)] bg-premium-light flex items-center justify-center p-4">
//       <GlassCard className="w-full max-w-md !p-8 border-gray-200/80 shadow-2xl flex flex-col gap-6 animate-fade-in">
        
//         <div className="text-center">
//           <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">Access Ecosystem</span>
//           <h1 className="text-2xl font-black text-premium-dark mt-1">Sign In to SkillSphere</h1>
//         </div>

//         {error && (
//           <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
//             {error}
//           </div>
//         )}

//         <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col gap-2.5">
//           <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 text-center">
//             ⚡ Instant Sandbox Testing (Skip Password)
//           </span>
//           <div className="grid grid-cols-2 gap-2">
//             <Button variant="outline" size="sm" onClick={() => handleDemoLogin('client')} className="!bg-white">
//               Login as Client
//             </Button>
//             <Button variant="outline" size="sm" onClick={() => handleDemoLogin('freelancer')} className="!bg-white">
//               Login as Freelancer
//             </Button>
//           </div>
//         </div>

//         <div className="relative flex py-1 items-center">
//           <div className="flex-grow border-t border-gray-200"></div>
//           <span className="flex-shrink mx-3 text-gray-400 text-xs font-bold uppercase">Or use credentials</span>
//           <div className="flex-grow border-t border-gray-200"></div>
//         </div>

//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <Input
//             id="email"
//             label="Email Address"
//             type="email"
//             placeholder="client@skillsphere.io"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <Input
//             id="password"
//             label="Password"
//             type="password"
//             placeholder="••••••••"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
          
//           <Button type="submit" variant="primary" size="md" fullWidth disabled={isLoading} className="mt-2">
//             {isLoading ? 'Authenticating...' : 'Sign In'}
//           </Button>
//         </form>

//         <p className="text-center text-xs text-gray-500 font-medium">
//           Don't have an account yet?{' '}
//           <Link to="/register" className="font-bold text-black hover:underline">
//             Create Account
//           </Link>
//         </p>

//       </GlassCard>
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
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      setIsLoading(false);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      
      setStatusMessage({ type: 'success', text: 'Authentication successful. Redirecting to workspace...' });
      
      setTimeout(() => {
        navigate('/gigs');
        window.location.reload();
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      setStatusMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Access Denied. Check credentials and try again.' 
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md !p-8 border-gray-200/80 shadow-2xl flex flex-col gap-6 animate-fade-in">
        
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-premium-accent">Identity Verification</span>
          <h1 className="text-2xl font-black text-premium-dark mt-1">Sign In to SkillSphere</h1>
        </div>

        {statusMessage.text && (
          <div className={`p-4 rounded-xl text-xs font-bold text-center border transition-all ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Verified Email Address"
            type="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Account Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button type="submit" variant="primary" size="md" fullWidth disabled={isLoading} className="mt-2">
            {isLoading ? 'Decrypting Secure Token...' : 'Authenticate Account'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-500 font-medium">
          New to the ecosystem?{' '}
          <Link to="/register" className="font-bold text-black hover:underline">
            Create Verified Account
          </Link>
        </p>

      </GlassCard>
    </div>
  );
};

export default LoginPage;