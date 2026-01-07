
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import { AuthProvider } from './context/AuthContext';

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
import Navbar from "./components/Navbar";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import LoginForm from "./components/Auth/LoginForm"
import SignupForm from "./components/Auth/SignupForm"
import ProfileEditForm  from "./components/Auth/ProfileEditForm"
import Layout from "./components/Layout"

import './App.css'

/**
 * App Component - Main container and state management
 * 
 * Manages:
 * - Post likes state (object with postId as key)
 * - Current story carousel position
 * - Search query input
 * - Active navigation tab
 * 
 * @returns {React.ReactElement} Main application layout
 */
const App = () => {
  // ============= STATE MANAGEMENT =============
  
  /** Track liked posts with object: { postId: boolean } */
  const [likedPosts, setLikedPosts] = useState({});
  
  /** Current story index for carousel rotation */
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
  /** Search input value for finding users/posts */
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
    if (location.pathname === "/" || location.pathname === "/home") setActiveTab("Home");
    else if (location.pathname === "/messages") setActiveTab("Messages");
    else if (location.pathname === "/profile") setActiveTab("Profile");
    else if (location.pathname === "/settings") setActiveTab("Settings");
  }, [location.pathname, setActiveTab]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />

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
    </Routes>
  );
  // ============= MOCK DATA - Stories =============
  
  /**
   * Array of story objects with user avatars
   * Stories are displayed in a horizontal carousel with auto-scroll
   * In production, this would be fetched from a backend API
   */
  const stories = [
    { id: 1, username: "user1", avatar: "https://placehold.co/100x100/FF6B6B/FFFFFF?text=U1" },
    { id: 2, username: "user2", avatar: "https://placehold.co/100x100/4ECDC4/FFFFFF?text=U2" },
    { id: 3, username: "user3", avatar: "https://placehold.co/100x100/45B7D1/FFFFFF?text=U3" },
    { id: 4, username: "user4", avatar: "https://placehold.co/100x100/96CEB4/FFFFFF?text=U4" },
    { id: 5, username: "user5", avatar: "https://placehold.co/100x100/FFEAA7/FFFFFF?text=U5" },
    { id: 6, username: "user6", avatar: "https://placehold.co/100x100/DDA0DD/FFFFFF?text=U6" },
    { id: 7, username: "user7", avatar: "https://placehold.co/100x100/FFB3BA/FFFFFF?text=U7" },
  ];

  // ============= MOCK DATA - Feed Posts =============
  
  /**
   * Array of post objects representing social media posts
   * Each post contains:
   * - id: Unique identifier
   * - user: Author info (username, avatar)
   * - media: Image URL for post
   * - caption: Text content with hashtags
   * - likes: Like count (updated when user interacts)
   * - comments: Comment count
   * 
   * In production, this would be fetched from a backend API
   */
  const posts = [
    {
      id: 1,
      user: { username: "traveler_adventures", avatar: "https://placehold.co/40x40/FF6B6B/FFFFFF?text=TA" },
      media: "https://placehold.co/500x600/4ECDC4/FFFFFF?text=Beautiful+Landscape",
      caption: "Exploring the hidden gems of nature 🌿 #wanderlust #naturephotography",
      likes: 245,
      comments: 18,
    },
    {
      id: 2,
      user: { username: "foodie_delights", avatar: "https://placehold.co/40x40/45B7D1/FFFFFF?text=FD" },
      media: "https://placehold.co/500x600/FFEAA7/FFFFFF?text=Delicious+Food",
      caption: "Just tried the best pasta in town! 🍝 Tag someone who needs to try this! #foodie #pasta",
      likes: 892,
      comments: 43,
    },
    {
      id: 3,
      user: { username: "fitness_motivation", avatar: "https://placehold.co/40x40/96CEB4/FFFFFF?text=FM" },
      media: "https://placehold.co/500x600/DDA0DD/FFFFFF?text=Workout+Session",
      caption: "Consistency is key 💪 Day 45 of my fitness journey! #fitness #gymmotivation",
      likes: 1567,
      comments: 89,
    },
  ];

  // ============= MOCK DATA - Suggested Accounts =============
  
  /**
   * Array of recommended user accounts to follow
   * Displayed in the right sidebar with follow button
   * Each account has username, avatar, and follower count
   */
  const suggestedAccounts = [
    { username: "tech_guru", avatar: "https://placehold.co/40x40/FF6B6B/FFFFFF?text=TG", followers: "1.2M" },
    { username: "design_pro", avatar: "https://placehold.co/40x40/4ECDC4/FFFFFF?text=DP", followers: "890K" },
    { username: "code_wizard", avatar: "https://placehold.co/40x40/45B7D1/FFFFFF?text=CW", followers: "650K" },
  ];

  // ============= MOCK DATA - Trending Content =============
  
  /** Array of popular hashtags to display in trending section */
  const trendingHashtags = ["#photography", "#travel", "#fashion", "#food", "#art", "#fitness"];

  // ============= MOCK DATA - Online Friends =============
  
  /**
   * Array of friends currently online
   * Displayed with green status indicator in right sidebar
   */
  const onlineFriends = [
    { username: "friend_one", avatar: "https://placehold.co/30x30/96CEB4/FFFFFF?text=F1" },
    { username: "friend_two", avatar: "https://placehold.co/30x30/DDA0DD/FFFFFF?text=F2" },
    { username: "friend_three", avatar: "https://placehold.co/30x30/FFB3BA/FFFFFF?text=F3" },
  ];

  // ============= MOCK DATA - Navigation Menu =============
  
  /**
   * Navigation menu items for left sidebar
   * Each item has:
   * - icon: Emoji icon for visual identification
   * - label: Navigation label
   * - active: Boolean indicating if currently selected
   */
  const menuItems = [
    { icon: "🏠", label: "Home", active: activeTab === "Home" },
    { icon: "🔍", label: "Explore", active: activeTab === "Explore" },
    { icon: "🎬", label: "Reels", active: activeTab === "Reels" },
    { icon: "💬", label: "Messages", active: activeTab === "Messages" },
    { icon: "🔔", label: "Notifications", active: activeTab === "Notifications" },
    { icon: "⚙️", label: "Settings", active: activeTab === "Settings" },
  ];

  // ============= EFFECTS & EVENT HANDLERS =============

  /**
   * Auto-scroll stories carousel every 3 seconds
   * Cycles through stories continuously for continuous viewing experience
   * Cleanup interval on component unmount to prevent memory leaks
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stories.length]);

  /**
   * Toggle like state for a post
   * Updates the likedPosts object and animates the heart icon
   * 
   * @param {number} postId - ID of the post to like/unlike
   */
  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  /**
   * Handle navigation tab click
   * Updates active tab to highlight current section
   * 
   * @param {string} tabLabel - Name of the tab (e.g., "Home", "Explore")
   */
  const handleTabClick = (tabLabel) => {
    setActiveTab(tabLabel);
  };

  // ============= RENDER =============

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Home />
                  </div>
                  <div className="lg:col-span-1">
                    <RightSidebar />
                  </div>
                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="/trending" element={
          <div className="min-h-screen bg-gray-50">
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
          <div className="min-h-screen bg-gray-50">
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
          <div className="min-h-screen bg-gray-50">
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
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <CreateStory />
              </div>
            </div>
          </div>
        } />
        <Route path="/messages" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Messages />
              </div>
            </div>
          </div>
        } />
        <Route path="/notifications" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Notifications />
              </div>
            </div>
          </div>
        } />
        <Route path="/profile" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Profile />
              </div>
            </div>
          </div>
        } />
        <Route path="/edit-profile" element={
          <div className="min-h-screen bg-gray-50">
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
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <More />
              </div>
            </div>
          </div>
        } />
        <Route path="/settings" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Settings />
              </div>
            </div>
          </div>
        } />
        <Route path="/reels" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Reels />
            </div>
          </div>
        } />
        <Route path="/create-post" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <CreatePost />
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>

  );
};

export default App;
