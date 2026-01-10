import { lazy, Suspense } from "react";
import { PostSkeleton } from "../components/SkeletonLoader";
import { Route, Routes } from "react-router-dom";
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
const NotificationCenter = lazy(() => import("../components/NotificationCenter.jsx"));
const NotificationPreferences = lazy(() => import("../components/NotificationPreferences.jsx"));
const SearchResults = lazy(() => import("../pages/SearchResults.jsx"));
const Settings = lazy(() => import("../pages/Settings.jsx"));
const Profile = lazy(() => import("../pages/Profile.jsx"));
const Messages = lazy(() => import("../pages/Messages.jsx"));
const More = lazy(() => import("../pages/More.jsx"));
const Stories = lazy(() => import("../pages/Stories.jsx"));
const Explore = lazy(() => import("../pages/Explore.jsx"));

const AppRoutes = ({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
}) => {
    return (
        <Routes>
      <Route
        path="/landing"
        element={
          <LazyWrapper>
            <Landing />
          </LazyWrapper>
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

      <Route
        path="/*"
        element={
          <MainLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        }
      >
        <Route
          index
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
      </Route>
    </Routes>
    );
};

export default AppRoutes;
