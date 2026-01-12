import { lazy, Suspense } from "react";
import { PostSkeleton } from "../components/SkeletonLoader";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layout/MainLayout.jsx";

const LazyWrapper = ({ children }) => (
  <Suspense fallback={<PostSkeleton />}>
    {children}
  </Suspense>
);

const Reels = lazy(() => import("../pages/Reels.jsx"));
const ContactUs = lazy(() => import("../pages/ContactUs.jsx"));
const CertificatePage = lazy(() => import("../pages/CertificatePage.jsx"));
const GamifiedAssessmentPage = lazy(() =>
  import("../pages/GamifiedAssessmentPage.jsx")
);
const AdvancedSyllabusPage = lazy(() =>
  import("../pages/AdvancedSyllabusPage.jsx")
);
const Home = lazy(() => import("../pages/Home.jsx"));
const CreatePost = lazy(() => import("../components/CreatePost.jsx"));
const CoursesLanding = lazy(() => import("../pages/CoursesLanding.jsx"));
const LearningMode = lazy(() => import("../pages/LearningMode.jsx"));
const Landing = lazy(() => import("../pages/Landing.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Signup = lazy(() => import("../pages/Signup.jsx"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword.jsx"));
const NotificationCenter = lazy(() => import("../components/NotificationCenter.jsx"));
const NotificationPreferences = lazy(() => import("../components/NotificationPreferences.jsx"));
const SearchResults = lazy(() => import("../pages/SearchResults.jsx"));
const ModerationDashboard = lazy(() => import("../pages/admin/ModerationDashboard.jsx"));
const ReportDetail = lazy(() => import("../pages/admin/ReportDetail.jsx"));
const Settings = lazy(() => import("../pages/Settings.jsx"));
const Profile = lazy(() => import("../pages/Profile.jsx"));
const EditProfile = lazy(() => import("../pages/EditProfile.jsx"));
const Messages = lazy(() => import("../pages/Messages.jsx"));
const More = lazy(() => import("../pages/More.jsx"));
const Stories = lazy(() => import("../pages/Stories.jsx"));
const Explore = lazy(() => import("../pages/Explore.jsx"));
const Trending = lazy(() => import("../pages/Trending.jsx"));
const Feed = lazy(() => import("../pages/Feed.jsx"));
const StudyBuddyMatcher = lazy(() => import("../pages/StudyBuddyMatcher.jsx"));
const InstructorDashboard = lazy(() => import("../pages/InstructorDashboard.jsx"));
const ResumeBuilder = lazy(() => import("../pages/ResumeBuilder.jsx"));
const AlumniResumeReview = lazy(() => import("../pages/AlumniResumeReview.jsx"));
const AlumniConnect = lazy(() => import("../pages/AlumniConnect.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PostSkeleton />;
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

const AppRoutes = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
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
          path="resume/build"
          element={
              <LazyWrapper>
                  <ResumeBuilder />
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
