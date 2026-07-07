import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ExploreGigsPage from './pages/ExploreGigsPage';
import TalentDirectoryPage from './pages/TalentDirectoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientProposalsPage from './pages/ClientProposalsPage';
import EditProfilePage from './pages/EditProfilePage';
import FreelancerDashboardPage from './pages/FreelancerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ChatRoomPage from './pages/ChatRoomPage';
import ProjectExecutionPage from './pages/ProjectExecutionPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/gigs" replace />} />
        <Route path="/gigs" element={<ExploreGigsPage />} />
        <Route path="/freelancers" element={<TalentDirectoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/client/proposals" element={<ClientProposalsPage />} />
        <Route path="/freelancer/edit-profile" element={<EditProfilePage />} />
        <Route path="/freelancer/dashboard" element={<FreelancerDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/chat/:roomId" element={<ChatRoomPage />} />
        <Route path="/dashboard/tracker/:gigId" element={<ProjectExecutionPage />} />
      </Routes>
    </Router>
  );
}

export default App;