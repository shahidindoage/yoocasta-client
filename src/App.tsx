import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import BlogsPage from './pages/BlogsPage';
import BlogDetailsPage from './pages/BlogDetailsPage';
import MyApplications from './pages/talent/MyApplications';
import ShortlistedApplicants from './pages/talent/ShortlistedApplicants';
import MyJobInvitations from './pages/talent/MyJobInvitations';
import MatchingJobs from './pages/talent/MatchingJobs';
import MySubscriptionPlan from './pages/talent/MySubscriptionPlan';
import SubscriptionPlans from './pages/SubscriptionPlans';
import AboutUs from './pages/AboutUs';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import CastBags from './pages/recruiter/CastBags';
import Favourites from './pages/recruiter/Favourites';
import SentInvitations from './pages/recruiter/SentInvitations';
import PublicJobInvitation from './pages/jobs/PublicJobInvitation';
import PublicCastBag from './pages/PublicCastBag';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import ManageTalents from './pages/admin/ManageTalents';

// Placeholder dashboard pages (we'll build these next)

const Unauthorized = () => <div><h1>Unauthorized</h1></div>;

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div id="app-root" className="flex min-h-screen flex-col bg-white text-neutral-900 selection:bg-amber-400 selection:text-neutral-950">
      {!isAdminRoute && <Header />}
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
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:blogId" element={<BlogDetailsPage />} />
          <Route path="/subscription-plans" element={<SubscriptionPlans />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/jobs/:jobId" element={<PublicJobPage />} />
          <Route path="/invitation/:jobId" element={<PublicJobInvitation />} />
          <Route path="/cast-bag/:token" element={<PublicCastBag />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/talents" element={<ManageTalents />} />
            </Route>
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['TALENT']} />}>
            <Route path="/dashboard/talent" element={<TalentDashboard />} />
            <Route path="/dashboard/talent/profile-setup" element={<ProfileSetup />} />
            <Route path="/dashboard/talent/profile" element={<ViewProfile />} />
            <Route path="/dashboard/talent/applications" element={<MyApplications />} />
            <Route path="/dashboard/talent/applications/shortlisted/:roleId" element={<ShortlistedApplicants />} />
            <Route path="/dashboard/talent/my-invitations" element={<MyJobInvitations />} />
            <Route path="/dashboard/talent/matching-jobs" element={<MatchingJobs />} />
            <Route path="/dashboard/talent/subscription" element={<MySubscriptionPlan />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
            <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
            <Route path="/dashboard/recruiter/profile-setup" element={<RecruiterProfileSetup />} /> 
            <Route path="/dashboard/recruiter/post-job" element={<PostJob />} />
            <Route path="/dashboard/recruiter/jobs" element={<ManageJobs />} />
            <Route path="/dashboard/recruiter/cast-bags" element={<CastBags />} />
            <Route path="/dashboard/recruiter/favourites" element={<Favourites />} />
            <Route path="/dashboard/recruiter/sent-invitations" element={<SentInvitations />} />
            <Route path="/dashboard/recruiter/jobs/:jobId/applications" element={<JobApplications />} />
            <Route path="/dashboard/recruiter/applications/:applicationId" element={<ApplicationDetails />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;