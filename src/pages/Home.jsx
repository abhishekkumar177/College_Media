import { useState, useEffect } from "react";
import './App.css'
import { Route, Routes } from "react-router-dom";
import Reels from "./pages/Reels.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import CertificatePage from "./pages/CertificatePage.jsx";
import GamifiedAssessmentPage from "./pages/GamifiedAssessmentPage.jsx";
import AdvancedSyllabusPage from "./pages/AdvancedSyllabusPage.jsx";
import LeftSidebar from "./components/LeftSidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import CreatePost from "./components/CreatePost.jsx";
import CoursesLanding from "./pages/CoursesLanding.jsx";

const Home = ({ likedPosts, toggleLike, currentStoryIndex, setCurrentStoryIndex, stories, posts, suggestedAccounts, trendingHashtags, onlineFriends }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setCurrentStoryIndex(index)}
              >
                <div className={`relative w-16 h-16 rounded-full border-2 transition-all duration-500 ${index === currentStoryIndex ? "border-gradient-to-r" : "border-gray-300"}`}>
                  <img src={story.avatar} alt={story.username} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-xs text-gray-600 truncate w-16 text-center">{story.username}</span>
              </div>
            ))}
          </div>
        </div>

        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="flex items-center p-4 border-b border-gray-100">
              <img src={post.user.avatar} alt={post.user.username} className="w-10 h-10 rounded-full mr-3" />
              <span className="font-semibold text-gray-800">{post.user.username}</span>
            </div>
            <img src={post.media} alt="Post content" className="w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center space-x-4 mb-3">
                <button onClick={() => toggleLike(post.id)} className="flex items-center space-x-1 group">
                   <svg className={`w-6 h-6 transition-all duration-300 ${likedPosts[post.id] ? "fill-pink-500 text-pink-500" : "text-gray-600"}`} fill={likedPosts[post.id] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                   </svg>
                   <span>{likedPosts[post.id] ? post.likes + 1 : post.likes}</span>
                </button>
              </div>
              <p className="text-gray-800"><span className="font-semibold mr-2">{post.user.username}</span>{post.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-4">Suggested for you</h3>
          <div className="space-y-3">
            {suggestedAccounts.map((account, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={account.avatar} alt={account.username} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{account.username}</p>
                    <p className="text-gray-500 text-xs">{account.followers}</p>
                  </div>
                </div>
                <button className="text-blue-500 text-sm font-semibold">Follow</button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
           <h3 className="font-bold text-gray-800 mb-4">Trending</h3>
           <div className="flex flex-wrap gap-2">
             {trendingHashtags.map((tag, i) => <span key={i} className="text-purple-700 bg-purple-50 px-2 py-1 rounded text-sm">{tag}</span>)}
           </div>
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

  const stories = [
    { id: 1, username: "user1", avatar: "https://placehold.co/100x100/FF6B6B/FFFFFF?text=U1" },
    { id: 2, username: "user2", avatar: "https://placehold.co/100x100/4ECDC4/FFFFFF?text=U2" },
    // Add more stories
  ];

  const posts = [
    {
      id: 1,
      user: {
        username: "X_AE_A-13",
        handle: "@xaea13",
        title: "Product Designer, CollegeUI",
        avatar: "https://placehold.co/48x48/4F46E5/FFFFFF?text=XA",
        time: "2 hours ago",
      },
      media:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
      caption:
        "Just wrapped up an amazing group project with the best teammates! The semester might be ending, but the memories and skills we built together will last forever.",
      hashtags: ["#campuslife", "#teamwork"],
      likes: 127,
      comments: 45,
      shares: 12,
    },
    {
      id: 2,
      user: {
        username: "StudyBuddy",
        handle: "@studybuddies",
        title: "Study Group Leader",
        avatar: "https://placehold.co/48x48/10B981/FFFFFF?text=SB",
        time: "5 hours ago",
      },
      media:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
      caption:
        "Late night study session at the library with amazing friends!",
      hashtags: ["#studynight"],
      likes: 89,
      comments: 23,
      shares: 5,
    },
    {
      id: 3,
      user: {
        username: "CampusChef",
        handle: "@campuschef",
        title: "Food Enthusiast",
        avatar: "https://placehold.co/48x48/EF4444/FFFFFF?text=CC",
        time: "1 day ago",
      },
      media:
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop",
      caption:
        "Experimenting with new recipes in the dorm kitchen!",
      hashtags: ["#foodie"],
      likes: 156,
      comments: 34,
      shares: 8,
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