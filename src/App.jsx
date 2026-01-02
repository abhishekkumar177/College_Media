/**
 * College Media - Main Application Component
 * 
 * A comprehensive social media feed application built with React.
 * Features include:
 * - Stories carousel with auto-scroll functionality
 * - Dynamic post feed with like/comment interactions
 * - Search functionality
 * - Navigation tabs (Home, Explore, Reels, Messages, Notifications, Settings)
 * - Suggested accounts sidebar
 * - Trending hashtags
 * - Online friends display
 * - Fully responsive gradient-themed UI
 * 
 * @component Main application container
 * @returns {React.ReactElement} Main app layout with navigation and feed
 */

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";

const App = () => {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");

}

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
  // ============= MOCK DATA - Trending Content =============
  
  /** Array of popular hashtags to display in trending section */
  const trendingHashtags = ["#photography", "#travel", "#fashion", "#food", "#art", "#fitness"];

  // ============= MOCK DATA - Online Friends =============
  
  /**
  // ============= MOCK DATA - Navigation Menu =============
  
  /**
   * Navigation menu items for left sidebar
   * Each item has:
   * - icon: Emoji icon for visual identification
   * - label: Navigation label
   * - active: Boolean indicating if currently selected
   */
   // ============= EFFECTS & EVENT HANDLERS =============

  /**
   * Auto-scroll stories carousel every 3 seconds
   * Cycles through stories continuously for continuous viewing experience
   * Cleanup interval on component unmount to prevent memory leaks
* Currently online
* Displayed with green status indicator in right sidebar
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
  // ============= RENDER =============

  return (
    <Router>
      <AppContent searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeTab={activeTab} setActiveTab={setActiveTab} />
    </Router>
  );
};

const AppContent = ({ searchQuery, setSearchQuery, activeTab, setActiveTab }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/home') {
      setActiveTab('Home');
    } else if (location.pathname === '/messages') {
      setActiveTab('Messages');
    } else if (location.pathname === '/profile') {
      setActiveTab('Profile');
    }
  }, [location.pathname, setActiveTab]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeTab={activeTab} setActiveTab={setActiveTab} />}>
        <Route index element={<Home />} />
      </Route>
      <Route path="/messages" element={<Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeTab={activeTab} setActiveTab={setActiveTab} />}>
        <Route index element={<Messages />} />
      </Route>
      <Route path="/profile" element={<Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeTab={activeTab} setActiveTab={setActiveTab} />}>
        <Route index element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default App;
