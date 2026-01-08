import { useState, useEffect } from "react";
import './App.css'
import { Route, Routes } from "react-router-dom";
import Reels from "./pages/Reels.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import CertificatePage from "./pages/CertificatePage.jsx";
import GamifiedAssessmentPage from "./pages/GamifiedAssessmentPage.jsx";
import AdvancedSyllabusPage from "./pages/AdvancedSyllabusPage.jsx";
import Home from "./pages/Home.jsx";
import LeftSidebar from "./components/LeftSidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import CreatePost from "./components/CreatePost.jsx";
import CoursesLanding from "./pages/CoursesLanding.jsx";

const App = () => {
  const [likedPosts, setLikedPosts] = useState({});
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");

  const stories = [
    { id: 1, username: "user1", avatar: "https://placehold.co/100x100/FF6B6B/FFFFFF?text=U1" },
    { id: 2, username: "user2", avatar: "https://placehold.co/100x100/4ECDC4/FFFFFF?text=U2" },
    { id: 3, username: "user3", avatar: "https://placehold.co/100x100/45B7D1/FFFFFF?text=U3" },
    { id: 4, username: "user4", avatar: "https://placehold.co/100x100/96CEB4/FFFFFF?text=U4" },
    { id: 5, username: "user5", avatar: "https://placehold.co/100x100/FFEAA7/FFFFFF?text=U5" },
    { id: 6, username: "user6", avatar: "https://placehold.co/100x100/DDA0DD/FFFFFF?text=U6" },
    { id: 7, username: "user7", avatar: "https://placehold.co/100x100/FFB3BA/FFFFFF?text=U7" },
  ];

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

  const suggestedAccounts = [
    { username: "tech_guru", avatar: "https://placehold.co/32x32/FF6B6B/FFFFFF?text=TG", followers: "1.2M" },
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <main className="lg:col-span-3">
             <Routes>
                <Route path="/" element={
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
                } />
                
                <Route path="/reels" element={<Reels />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/certificate" element={<CertificatePage />} />
                <Route path="/assessment" element={<GamifiedAssessmentPage />} />
                <Route path="/courses" element={<CoursesLanding />} />
                <Route path="/advanced-syllabus" element={<AdvancedSyllabusPage />} />
             </Routes>
          </main>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .border-gradient-to-r { background: linear-gradient(to right, #ec4899, #8b5cf6, #f97316); border: 2px solid transparent; background-clip: padding-box, border-box; background-origin: padding-box, border-box; }
      `}</style>
    </div>
  );
};

export default App;