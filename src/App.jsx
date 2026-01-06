import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

/* ===== Pages ===== */
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Trending from "./pages/Trending";
import Explore from "./pages/Explore";
import Stories from "./pages/Stories";
import CreateStory from "./pages/CreateStory";
import Notifications from "./pages/Notifications";
import More from "./pages/More";
import Settings from "./pages/Settings";
import Reels from "./pages/Reels";
import CreatePost from "./pages/CreatePost";
import ContactUs from "./pages/ContactUs";
import Navbar from "./components/Navbar";
import LeftSidebar from "./components/LeftSidebar";
import Layout from "./components/Layout";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import ProfileEditForm from "./components/Auth/ProfileEditForm";
import './App.css'

/**
 * App Component - Main container and state management
 */
const App = () => {
  // ============= STATE MANAGEMENT =============
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Feed");

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent = ({ searchQuery, setSearchQuery, activeTab, setActiveTab }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/home") setActiveTab("Home");
    else if (location.pathname === "/messages") setActiveTab("Messages");
    else if (location.pathname === "/profile") setActiveTab("Profile");
    else if (location.pathname === "/settings") setActiveTab("Settings");
    else if (location.pathname === "/create-post") setActiveTab("Create Post");
  }, [location.pathname, setActiveTab]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />

      {/* Layout Routes */}
      <Route
        path="/home"
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <Route index element={<Home />} />
      </Route>

      <Route
        path="/messages"
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <Route index element={<Messages />} />
      </Route>

      <Route
        path="/profile"
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <Route index element={<Profile />} />
        <Route path="edit" element={<ProfileEditForm />} />
      </Route>

      <Route
        path="/settings"
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <Route index element={<Settings />} />
      </Route>

      {/* Individual Routes without Layout */}
      <Route path="/trending" element={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="ml-64">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-5xl mx-auto px-6 py-8">
              <Trending />
            </div>
          </div>
        </div>
      } />
      <Route path="/explore" element={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="ml-64">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-5xl mx-auto px-6 py-8">
              <Explore />
            </div>
          </div>
        </div>
      } />
      <Route path="/stories" element={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="ml-64">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-5xl mx-auto px-6 py-8">
              <Stories />
            </div>
          </div>
        </div>
      } />
      <Route path="/create-story" element={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="ml-64">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-5xl mx-auto px-6 py-8">
              <CreateStory />
            </div>
          </div>
        </div>
      } />
      <Route path="/notifications" element={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="ml-64">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-5xl mx-auto px-6 py-8">
              <Notifications />
            </div>
          </div>
        </div>
      } />
      <Route path="/edit-profile" element={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="ml-64">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-5xl mx-auto px-6 py-8">
              <EditProfile />
            </div>
          </div>
        </div>
      } />
      <Route path="/more" element={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="ml-64">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-5xl mx-auto px-6 py-8">
              <More />
            </div>
          </div>
        </div>
      } />
      <Route
        path="/reels"
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <Route index element={<Reels />} />
      </Route>
      
      <Route path="/create-post" element={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="ml-64">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="max-w-5xl mx-auto px-6 py-8">
              <CreatePost />
            </div>
          </div>
        </div>
      } />
      
      <Route path="/contact" element={<ContactUs />} />
    </Routes>
  );
};

export default App;