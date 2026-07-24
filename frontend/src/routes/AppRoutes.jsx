import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';

const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const OAuthCallback = lazy(() => import('../pages/OAuthCallback'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const GigBrowse = lazy(() => import('../pages/gigs/GigBrowse'));
const GigDetail = lazy(() => import('../pages/gigs/GigDetail'));
const GigForm = lazy(() => import('../pages/gigs/GigForm'));
const PublicProfile = lazy(() => import('../pages/profile/PublicProfile'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-paper">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-signal" />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        <Route path="/gigs" element={<GigBrowse />} />
        <Route
          path="/gigs/new"
          element={
            <ProtectedRoute>
              <GigForm />
            </ProtectedRoute>
          }
        />
        <Route path="/gigs/:id" element={<GigDetail />} />
        <Route
          path="/gigs/:id/edit"
          element={
            <ProtectedRoute>
              <GigForm />
            </ProtectedRoute>
          }
        />
        <Route path="/freelancers/:userId" element={<PublicProfile />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
