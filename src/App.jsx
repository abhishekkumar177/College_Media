import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

/* ===== Pages ===== */
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ForgotPassword from './pages/ForgetPassword';
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import ProfileEditForm from "./components/Auth/ProfileEditForm";
import Trending from "./pages/Trending";
import Explore from "./pages/Explore";
import Stories from "./pages/Stories";
import CreateStory from "./pages/CreateStory";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Reels from "./pages/Reels";
import CreatePost from "./pages/CreatePost";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";

import Layout from "./components/Layout";

import React, { useState, useEffect } from "react";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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
    if (location.pathname.startsWith("/home")) setActiveTab("Feed");
    else if (location.pathname.startsWith("/trending")) setActiveTab("Trending");
    else if (location.pathname.startsWith("/explore")) setActiveTab("Explore");
    else if (location.pathname.startsWith("/stories")) setActiveTab("Stories");
    else if (location.pathname.startsWith("/reels")) setActiveTab("Reels");
    else if (location.pathname.startsWith("/messages")) setActiveTab("Messages");
    else if (location.pathname.startsWith("/profile")) setActiveTab("Profile");
    else if (location.pathname.startsWith("/settings")) setActiveTab("Settings");
  }, [location.pathname]);

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ===== PRO LAYOUT (ALL APP PAGES) ===== */}
      <Route
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/create-story" element={<CreateStory />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEditForm />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create-post" element={<CreatePost />} />
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
      <Route path="/certificate" element={<CertificatePage />} />
      <Route path="/assessment" element={<GamifiedAssessmentPage />} />
      
      <Route path="/advanced-syllabus" element={<AdvancedSyllabusPage />} />
    </Routes>
  );
};

export default App;
