import React, { lazy, Suspense, ReactNode } from "react";
import { PostSkeleton } from "../components/SkeletonLoader";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layout/MainLayout";
import ExploreHub from "../pages/ExplorerHub";
import PricingPage from "../pages/PricingPage";

interface LazyWrapperProps {
  children: ReactNode;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ children }) => (
  <Suspense fallback={<PostSkeleton />}>
    {children}
  </Suspense>
);

const Reels = lazy(() => import("../pages/Reels"));
const ContactUs = lazy(() => import("../pages/ContactUs"));
const CertificatePage = lazy(() => import("../pages/CertificatePage"));
const GamifiedAssessmentPage = lazy(() =>
  import("../pages/GamifiedAssessmentPage")
);
const AdvancedSyllabusPage = lazy(() =>
  import("../pages/AdvancedSyllabusPage")
);
const Home = lazy(() => import("../pages/Home"));
const CreatePost = lazy(() => import("../components/CreatePost"));
const CoursesLanding = lazy(() => import("../pages/CoursesLanding"));
const LearningMode = lazy(() => import("../pages/LearningMode"));
const Landing = lazy(() => import("../pages/Landing"));
const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const NotificationCenter = lazy(() => import("../components/NotificationCenter"));
const NotificationPreferences = lazy(() => import("../components/NotificationPreferences"));
const SearchResults = lazy(() => import("../pages/SearchResults"));
const ModerationDashboard = lazy(() => import("../pages/admin/ModerationDashboard"));
const ReportDetail = lazy(() => import("../pages/admin/ReportDetail"));
const Settings = lazy(() => import("../pages/Settings"));
const Profile = lazy(() => import("../pages/Profile"));
const EditProfile = lazy(() => import("../pages/EditProfile"));
const Messages = lazy(() => import("../pages/Messages"));
const More = lazy(() => import("../pages/More"));
const Stories = lazy(() => import("../pages/Stories"));
const Explore = lazy(() => import("../pages/Explore"));
const Trending = lazy(() => import("../pages/Trending"));
const Feed = lazy(() => import("../pages/Feed"));
const StudyBuddyMatcher = lazy(() => import("../pages/StudyBuddyMatcher"));
const InstructorDashboard = lazy(() => import("../pages/InstructorDashboard"));
const ResumeBuilder = lazy(() => import("../pages/ResumeBuilder"));
const ATSResume = lazy(() => import("../pages/ATSResume"));
const AlumniResumeReview = lazy(() => import("../pages/AlumniResumeReview"));
const AlumniConnect = lazy(() => import("../pages/AlumniConnect"));
const Marketplace = lazy(() => import("../pages/Marketplace"));
const CollabDashboard = lazy(() => import("../pages/CollabDashboard"));
const CollabDoc = lazy(() => import("../pages/CollabDoc"));
const EventsHub = lazy(() => import("../pages/EventsHub"));
const NotFound = lazy(() => import("../pages/NotFound"));

interface ProtectedRouteProps {
  children: ReactNode;
}

// Protected Route wrapper
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🔐 ProtectedRoute check:', { hasUser: !!user, loading });

  // Always show loading skeleton while authentication is being verified
  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading, showing skeleton');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PostSkeleton />
      </div>
    );
  }

  // Only redirect if we're sure there's no user (loading complete)
  if (!user) {
    console.log('❌ ProtectedRoute: No user found, redirecting to landing');
    return <Navigate to="/landing" replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering protected content');
  return children;
};

interface AppRoutesProps {
  props: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  };
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  props: {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
  }
}) => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/landing"
        element={
          user ? <Navigate to="/" replace /> : (
            <LazyWrapper>
              <Landing />
            </LazyWrapper>
          )
        }
      />
      <Route
        path="/login"
        element={
          user ? <Navigate to="/" replace /> : (
            <LazyWrapper>
              <Login />
            </LazyWrapper>
          )
        }
      />

      <Route
        path="/signup"
        element={
          user ? <Navigate to="/" replace /> : (
            <LazyWrapper>
              <Signup />
            </LazyWrapper>
          )
        }
      />

      <Route
        path="/forgot-password"
        element={
          user ? <Navigate to="/" replace /> : (
            <LazyWrapper>
              <ForgotPassword />
            </LazyWrapper>
          )
        }
      />

      <Route
        path="/learning"
        element={
          <LazyWrapper>
            <LearningMode />
          </LazyWrapper>
        }
      />

      <Route path="/explore-hub" element={<ExploreHub />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <LazyWrapper>
              <Feed />
            </LazyWrapper>
          }
        />

        <Route
          path="home"
          element={
            <LazyWrapper>
              <Home />
            </LazyWrapper>
          }
        />
        <Route
          path="reels"
          element={
            <LazyWrapper>
              <Reels />
            </LazyWrapper>
          }
        />


        <Route
          path="create-post"
          element={
            <LazyWrapper>
              <CreatePost />
            </LazyWrapper>
          }
        />

        <Route
          path="search"
          element={
            <LazyWrapper>
              <SearchResults />
            </LazyWrapper>
          }
        />

        <Route
          path="notifications"
          element={
            <LazyWrapper>
              <NotificationCenter />
            </LazyWrapper>
          }
        />

        <Route
          path="notifications/preferences"
          element={
            <LazyWrapper>
              <NotificationPreferences />
            </LazyWrapper>
          }
        />

        <Route
          path="admin/moderation"
          element={
            <LazyWrapper>
              <ModerationDashboard />
            </LazyWrapper>
          }
        />

        <Route
          path="admin/moderation/reports/:reportId"
          element={
            <LazyWrapper>
              <ReportDetail />
            </LazyWrapper>
          }
        />

        <Route
          path="contact"
          element={
            <LazyWrapper>
              <ContactUs />
            </LazyWrapper>
          }
        />

        <Route
          path="certificate"
          element={
            <LazyWrapper>
              <CertificatePage />
            </LazyWrapper>
          }
        />

        <Route
          path="assessment"
          element={
            <LazyWrapper>
              <GamifiedAssessmentPage />
            </LazyWrapper>
          }
        />

        <Route
          path="courses"
          element={
            <LazyWrapper>
              <CoursesLanding />
            </LazyWrapper>
          }
        />

        <Route
          path="advanced-syllabus"
          element={
            <LazyWrapper>
              <AdvancedSyllabusPage />
            </LazyWrapper>
          }
        />

        <Route
          path="settings"
          element={
            <LazyWrapper>
              <Settings />
            </LazyWrapper>
          }
        />

        <Route
          path="profile"
          element={
            <LazyWrapper>
              <Profile />
            </LazyWrapper>
          }
        />

        <Route
          path="edit-profile"
          element={
            <LazyWrapper>
              <EditProfile />
            </LazyWrapper>
          }
        />

        <Route
          path="messages"
          element={
            <LazyWrapper>
              <Messages />
            </LazyWrapper>
          }
        />

        <Route
          path="more"
          element={
            <LazyWrapper>
              <More />
            </LazyWrapper>
          }
        />

        <Route
          path="stories"
          element={
            <LazyWrapper>
              <Stories />
            </LazyWrapper>
          }
        />

        <Route
          path="explore"
          element={
            <LazyWrapper>
              <Explore />
            </LazyWrapper>
          }
        />

        <Route
          path="trending"
          element={
            <LazyWrapper>
              <Trending />
            </LazyWrapper>
          }
        />

        <Route
          path="feed"
          element={
            <LazyWrapper>
              <Feed />
            </LazyWrapper>
          }
        />

        <Route
          path="study-buddy"
          element={
            <LazyWrapper>
              <StudyBuddyMatcher />
            </LazyWrapper>
          }
        />

        <Route
          path="instructor/dashboard"
          element={
            <LazyWrapper>
              <InstructorDashboard />
            </LazyWrapper>
          }
        />

        <Route
          path="resume/build"
          element={
            <LazyWrapper>
              <ResumeBuilder />
            </LazyWrapper>
          }
        />

        <Route
          path="ats-resume"
          element={
            <LazyWrapper>
              <ATSResume />
            </LazyWrapper>
          }
        />

        <Route
          path="resume/review"
          element={
            <LazyWrapper>
              <AlumniResumeReview />
            </LazyWrapper>
          }
        />

        <Route
          path="alumni-connect"
          element={
            <LazyWrapper>
              <AlumniConnect />
            </LazyWrapper>
          }
        />

        <Route
          path="marketplace"
          element={
            <LazyWrapper>
              <Marketplace />
            </LazyWrapper>
          }
        />

        <Route
          path="collab/dashboard"
          element={
            <LazyWrapper>
              <CollabDashboard />
            </LazyWrapper>
          }
        />

        <Route
          path="collab/docs/:docId"
          element={
            <LazyWrapper>
              <CollabDoc />
            </LazyWrapper>
          }
        />

        <Route
          path="events/*"
          element={
            <LazyWrapper>
              <EventsHub />
            </LazyWrapper>
          }
        />

        <Route
          path="*"
          element={
            <LazyWrapper>
              <NotFound />
            </LazyWrapper>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <LazyWrapper>
            <NotFound />
          </LazyWrapper>
        }
      />
    </Routes >
  );
};

export default AppRoutes;
