import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './auth/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import SignupTalent from './pages/auth/SignupTalent';
import SignupRecruiter from './pages/auth/SignupRecruiter';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifyEmailNotice from './pages/auth/VerifyEmailNotice';
import VerifyEmailOtp from './pages/auth/VerifyEmailOtp';
import ProfileSetup from './pages/talent/ProfileSetup';
import TalentDashboard from './pages/talent/TalentDashboard';
import ViewProfile from './pages/talent/ViewProfile';
import PublicTalentProfile from './pages/talent/PublicTalentProfile';
import BrowseTalents from './pages/talent/BrowseTalents';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import RecruiterProfileSetup from './pages/recruiter/RecruiterProfileSetup';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/post-job/PostJob';
import ManageJobs from './pages/recruiter/ManageJobs';
import JobApplications from './pages/recruiter/JobApplications';
import ApplicationDetails from './pages/recruiter/ApplicationDetails';
import PublicJobPage from './pages/jobs/PublicJobPage';
import BrowseJobs from './pages/jobs/BrowseJobs';

// Placeholder dashboard pages (we'll build these next)

const Unauthorized = () => <div><h1>Unauthorized</h1></div>;

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div id="app-root" className="flex min-h-screen flex-col bg-white text-neutral-900 selection:bg-amber-400 selection:text-neutral-950">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : (!user?.isEmailVerified ? <Navigate to="/verify-email-otp" /> : <Navigate to={`/dashboard/${user?.role?.toLowerCase()}`} />)} />
          <Route path="/signup/talent" element={!isAuthenticated ? <SignupTalent /> : (!user?.isEmailVerified ? <Navigate to="/verify-email-otp" /> : <Navigate to="/dashboard/talent" />)} />
          <Route path="/signup/recruiter" element={!isAuthenticated ? <SignupRecruiter /> : (!user?.isEmailVerified ? <Navigate to="/verify-email-otp" /> : <Navigate to="/dashboard/recruiter" />)} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email-otp" element={<VerifyEmailOtp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/talent/:username" element={<PublicTalentProfile />} />
          <Route path="/browse-talents" element={<BrowseTalents />} />
          <Route path="/browse-jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:jobId" element={<PublicJobPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['TALENT']} />}>
            <Route path="/dashboard/talent" element={<TalentDashboard />} />
            <Route path="/dashboard/talent/profile-setup" element={<ProfileSetup />} />
            <Route path="/dashboard/talent/profile" element={<ViewProfile />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
            <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
            <Route path="/dashboard/recruiter/profile-setup" element={<RecruiterProfileSetup />} /> 
            <Route path="/dashboard/recruiter/post-job" element={<PostJob />} />
            <Route path="/dashboard/recruiter/jobs" element={<ManageJobs />} />
            <Route path="/dashboard/recruiter/jobs/:jobId/applications" element={<JobApplications />} />
            <Route path="/dashboard/recruiter/applications/:applicationId" element={<ApplicationDetails />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;