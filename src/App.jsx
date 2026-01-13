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

import React, { useState, useEffect } from "react";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NavigationBar from './components/NavigationBar';
import MenuItem from './components/MenuItem';
import StoriesCarousel from './components/StoriesCarousel';
import PostCard from './components/PostCard';
import SuggestedAccountItem from './components/SuggestedAccountItem';
import TrendingHashtag from './components/TrendingHashtag';
import OnlineFriendItem from './components/OnlineFriendItem';

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

  /** Active navigation tab name */
  const [activeTab, setActiveTab] = useState("Home");

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
    { username: "tech_guru", avatar: "https://placehold.co/32x32/FF6B6B/FFFFFF?text=TG", followers: "1.2M" },
    { username: "art_lover", avatar: "https://placehold.co/32x32/4ECDC4/FFFFFF?text=AL", followers: "850K" },
    { username: "fitness_pro", avatar: "https://placehold.co/32x32/45B7D1/FFFFFF?text=FP", followers: "2.1M" },
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      {/* ========== NAVIGATION BAR ========== */}
      <NavigationBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main content grid: Sidebar | Feed | Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ========== LEFT SIDEBAR ========== */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
              <div className="space-y-4">
                {menuItems.map((item, index) => (
                  <MenuItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    active={item.active}
                    onClick={() => handleTabClick(item.label)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ========== CENTRAL FEED ========== */}
          <div className="lg:col-span-2 space-y-6">
            {/* ========== STORIES CAROUSEL ========== */}
            <StoriesCarousel
              stories={stories}
              currentIndex={currentStoryIndex}
              onStoryClick={setCurrentStoryIndex}
            />

            {/* ========== POSTS FEED ========== */}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPosts[post.id]}
                onLikeToggle={() => toggleLike(post.id)}
              />
            ))}
          </div>

          {/* ========== RIGHT SIDEBAR ========== */}
          <div className="lg:col-span-1 space-y-6">
            {/* ========== SUGGESTED ACCOUNTS ========== */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-4">Suggested for you</h3>
              <div className="space-y-3">
                {suggestedAccounts.map((account, index) => (
                  <SuggestedAccountItem
                    key={index}
                    account={account}
                  />
                ))}
              </div>
            </div>

            {/* ========== TRENDING HASHTAGS ========== */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-4">Trending</h3>
              <div className="flex flex-wrap gap-2">
                {trendingHashtags.map((hashtag, index) => (
                  <TrendingHashtag
                    key={index}
                    hashtag={hashtag}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </div>

            {/* ========== ONLINE FRIENDS ========== */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-4">Online Friends</h3>
              <div className="flex space-x-3">
                {onlineFriends.map((friend, index) => (
                  <OnlineFriendItem
                    key={index}
                    friend={friend}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== GLOBAL STYLES ========== */}
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
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-bounce {
          animation: bounce 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
