import React, { useEffect, useState } from "react";
import "./App.css";
import { SearchProvider } from "./contexts/SearchContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import AppContent from "./components/AppContent";
import NavigationBar from "./components/NavigationBar"; // <-- adjust path if needed

/**
 * App Component - Main container and state management
 */
const App = () => {
  // ============= STATE MANAGEMENT =============
  const [likedPosts, setLikedPosts] = useState({});
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");

  // ============= MOCK DATA - Stories =============
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
  const suggestedAccounts = [
    { username: "tech_guru", avatar: "https://placehold.co/32x32/FF6B6B/FFFFFF?text=TG", followers: "1.2M" },
    { username: "art_lover", avatar: "https://placehold.co/32x32/4ECDC4/FFFFFF?text=AL", followers: "850K" },
    { username: "fitness_pro", avatar: "https://placehold.co/32x32/45B7D1/FFFFFF?text=FP", followers: "2.1M" },
  ];

  // ============= MOCK DATA - Trending Content =============
  const trendingHashtags = ["#photography", "#travel", "#fashion", "#food", "#art", "#fitness"];

  // ============= MOCK DATA - Online Friends =============
  const onlineFriends = [
    { username: "friend_one", avatar: "https://placehold.co/30x30/96CEB4/FFFFFF?text=F1" },
    { username: "friend_two", avatar: "https://placehold.co/30x30/DDA0DD/FFFFFF?text=F2" },
    { username: "friend_three", avatar: "https://placehold.co/30x30/FFB3BA/FFFFFF?text=F3" },
  ];

  // ============= MOCK DATA - Navigation Menu =============
  const menuItems = [
    { icon: "🏠", label: "Home", active: activeTab === "Home" },
    { icon: "🔍", label: "Explore", active: activeTab === "Explore" },
    { icon: "🎬", label: "Reels", active: activeTab === "Reels" },
    { icon: "💬", label: "Messages", active: activeTab === "Messages" },
    { icon: "🔔", label: "Notifications", active: activeTab === "Notifications" },
    { icon: "⚙️", label: "Settings", active: activeTab === "Settings" },
  ];

  // ============= EFFECTS =============
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [stories.length]);

  // ============= HANDLERS =============
  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleTabClick = (tabLabel) => {
    setActiveTab(tabLabel);
  };

  // ============= RENDER =============
  return (
    <SearchProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
          {/* NAVIGATION BAR */}
          <NavigationBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* LEFT SIDEBAR */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
                  <div className="space-y-4">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleTabClick(item.label)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-50 ${
                          item.active
                            ? "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT */}
              <AppContent
                activeTab={activeTab}
                stories={stories}
                currentStoryIndex={currentStoryIndex}
                setCurrentStoryIndex={setCurrentStoryIndex}
                posts={posts}
                likedPosts={likedPosts}
                toggleLike={toggleLike}
                suggestedAccounts={suggestedAccounts}
                trendingHashtags={trendingHashtags}
                onlineFriends={onlineFriends}
              />
            </div>
          </div>
        </div>
      </NotificationProvider>
    </SearchProvider>
  );
};

export default App;