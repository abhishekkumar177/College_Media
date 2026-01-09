import { useState, useEffect, lazy, Suspense } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LeftSidebar from "./components/LeftSidebar.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ErrorProvider } from "./context/ErrorContext.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { PostSkeleton } from "./components/SkeletonLoader.jsx";
import { useWebVitals, reportWebVitals } from "./hooks/useWebVitals.js";
import { performanceMonitor } from "./utils/performanceMonitor.js";
import BackButton from "./components/BackButton.jsx";
import InstallPWA from "./components/InstallPWA.jsx";
import OfflineIndicator from "./components/OfflineIndicator.jsx";

// Lazy load route components for code splitting
const Reels = lazy(() => import("./pages/Reels.jsx"));
const ContactUs = lazy(() => import("./pages/ContactUs.jsx"));
const CertificatePage = lazy(() => import("./pages/CertificatePage.jsx"));
const GamifiedAssessmentPage = lazy(() =>
  import("./pages/GamifiedAssessmentPage.jsx")
);
const AdvancedSyllabusPage = lazy(() =>
  import("./pages/AdvancedSyllabusPage.jsx")
);
const Home = lazy(() => import("./pages/Home.jsx"));
const CreatePost = lazy(() => import("./components/CreatePost.jsx"));
const CoursesLanding = lazy(() => import("./pages/CoursesLanding.jsx"));
const LearningMode = lazy(() => import("./pages/LearningMode.jsx"));
const Landing = lazy(() => import("./pages/Landing.jsx"));
const NotificationCenter = lazy(() => import("./components/NotificationCenter.jsx"));
const NotificationPreferences = lazy(() => import("./components/NotificationPreferences.jsx"));
const SearchResults = lazy(() => import("./pages/SearchResults.jsx"));

const MainLayout = ({
  children,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav 
        className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <div className="w-24 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity duration-300">
                <span className="text-white font-bold text-xl">InstaClone</span>
              </div>
            </div>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <label htmlFor="main-search" className="sr-only">Search posts and users</label>
                <input
                  id="main-search"
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-700 transition-all duration-300"
                  aria-label="Search posts and users"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
                aria-label="User profile menu"
              >
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1" aria-label="Sidebar navigation">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>
          <main id="main-content" className="lg:col-span-3" role="main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [likedPosts, setLikedPosts] = useState({});
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");

  // Initialize Web Vitals monitoring
  useWebVitals(reportWebVitals);

  useEffect(() => {
    // Mark app initialization
    performanceMonitor.mark("app-init");

    // Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then((registration) => {
          console.log("[SW] Registered:", registration);
        })
        .catch((error) => {
          console.error("[SW] Registration failed:", error);
        });
    }

    // Measure app load time
    window.addEventListener("load", () => {
      performanceMonitor.mark("app-loaded");
      performanceMonitor.measure("app-load-time", "app-init", "app-loaded");
      performanceMonitor.report();
    });
  }, []);

  const stories = [
    {
      id: 1,
      username: "user1",
      avatar: "https://placehold.co/100x100/FF6B6B/FFFFFF?text=U1",
    },
    {
      id: 2,
      username: "user2",
      avatar: "https://placehold.co/100x100/4ECDC4/FFFFFF?text=U2",
    },
    {
      id: 3,
      username: "user3",
      avatar: "https://placehold.co/100x100/45B7D1/FFFFFF?text=U3",
    },
    {
      id: 4,
      username: "user4",
      avatar: "https://placehold.co/100x100/96CEB4/FFFFFF?text=U4",
    },
    {
      id: 5,
      username: "user5",
      avatar: "https://placehold.co/100x100/FFEAA7/FFFFFF?text=U5",
    },
    {
      id: 6,
      username: "user6",
      avatar: "https://placehold.co/100x100/DDA0DD/FFFFFF?text=U6",
    },
    {
      id: 7,
      username: "user7",
      avatar: "https://placehold.co/100x100/FFB3BA/FFFFFF?text=U7",
    },
  ];

  const posts = [
    {
      id: 1,
      user: {
        username: "traveler_adventures",
        avatar: "https://placehold.co/40x40/FF6B6B/FFFFFF?text=TA",
      },
      media:
        "https://placehold.co/500x600/4ECDC4/FFFFFF?text=Beautiful+Landscape",
      caption:
        "Exploring the hidden gems of nature 🌿 #wanderlust #naturephotography",
      likes: 245,
      comments: 18,
    },
    {
      id: 2,
      user: {
        username: "foodie_delights",
        avatar: "https://placehold.co/40x40/45B7D1/FFFFFF?text=FD",
      },
      media: "https://placehold.co/500x600/FFEAA7/FFFFFF?text=Delicious+Food",
      caption:
        "Just tried the best pasta in town! 🍝 Tag someone who needs to try this! #foodie #pasta",
      likes: 892,
      comments: 43,
    },
    {
      id: 3,
      user: {
        username: "fitness_motivation",
        avatar: "https://placehold.co/40x40/96CEB4/FFFFFF?text=FM",
      },
      media: "https://placehold.co/500x600/DDA0DD/FFFFFF?text=Workout+Session",
      caption:
        "Consistency is key 💪 Day 45 of my fitness journey! #fitness #gymmotivation",
      likes: 1567,
      comments: 89,
    },
  ];

  const suggestedAccounts = [
    {
      username: "tech_guru",
      avatar: "https://placehold.co/32x32/FF6B6B/FFFFFF?text=TG",
      followers: "1.2M",
    },
  ];

  const trendingHashtags = ["#photography", "#travel", "#fashion"];
  const onlineFriends = [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stories.length]);

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <ErrorProvider>
      <ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#363636", color: "#fff" },
            success: {
              duration: 3000,
              iconTheme: { primary: "#10B981", secondary: "#fff" },
            },
            error: {
              duration: 4000,
              iconTheme: { primary: "#EF4444", secondary: "#fff" },
            },
          }}
        />

        <BackButton />

        <Routes>
          <Route
            path="/landing"
            element={
              <Suspense fallback={<PostSkeleton />}>
                <Landing />
              </Suspense>
            }
          />
          <Route
            path="/learning"
            element={
              <Suspense fallback={<PostSkeleton />}>
                <LearningMode />
              </Suspense>
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
              >
                <Suspense fallback={<PostSkeleton />}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Home
                          likedPosts={likedPosts}
                          toggleLike={toggleLike}
                          currentStoryIndex={currentStoryIndex}
                          setCurrentStoryIndex={setCurrentStoryIndex}
                          stories={stories}
                          posts={posts}
                          suggestedAccounts={suggestedAccounts}
                          trendingHashtags={trendingHashtags}
                          onlineFriends={onlineFriends}
                        />
                      }
                    />
                    <Route path="/reels" element={<Reels />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/notifications" element={<NotificationCenter />} />
                    <Route path="/notifications/preferences" element={<NotificationPreferences />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/certificate" element={<CertificatePage />} />
                    <Route
                      path="/assessment"
                      element={<GamifiedAssessmentPage />}
                    />
                    <Route path="/courses" element={<CoursesLanding />} />
                    <Route
                      path="/advanced-syllabus"
                      element={<AdvancedSyllabusPage />}
                    />
                  </Routes>
                </Suspense>
              </MainLayout>
            }
          />
        </Routes>

        {/* PWA Components */}
        <InstallPWA />
        <OfflineIndicator />

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .border-gradient-to-r {
            background: linear-gradient(to right, #ec4899, #8b5cf6, #f97316);
            border: 2px solid transparent;
            background-clip: padding-box, border-box;
            background-origin: padding-box, border-box;
          }
          
          /* PWA Animation */
          @keyframes slide-down {
            from {
              transform: translate(-50%, -100%);
              opacity: 0;
            }
            to {
              transform: translate(-50%, 0);
              opacity: 1;
            }
          }
          .animate-slide-down {
            animation: slide-down 0.3s ease-out;
          }
        `}</style>
      </ErrorBoundary>
    </ErrorProvider>
  );
};

export default App;
