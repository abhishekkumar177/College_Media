import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./context/AuthContext";

/* ===== Pages ===== */
import Landing from "./pages/Landing";
import Home from "./pages/Home";
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

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Feed");

  return (
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
    </Routes>
  );
};

export default App;
