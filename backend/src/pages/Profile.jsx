import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [userStats, setUserStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });

  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    // mock data (replace later with API)
    setUserStats({
      posts: 12,
      followers: 234,
      following: 180,
    });

    setUserPosts([
      { id: 1, imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop', likes: 45, comments: 12 },
      { id: 2, imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=400&fit=crop', likes: 67, comments: 23 },
      { id: 3, imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=400&fit=crop', likes: 89, comments: 15 },
      { id: 4, imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=400&h=400&fit=crop', likes: 34, comments: 8 },
      { id: 5, imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop', likes: 56, comments: 19 },
      { id: 6, imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop', likes: 78, comments: 25 },
    ]);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex justify-center md:justify-start">
            <div className="w-32 h-32 md:w-40 md:h-40">
              <img 
                src="https://placehold.co/200x200/4F46E5/FFFFFF?text=U" 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border-4 border-gray-100"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            {/* Username and Edit Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">johndoe_2026</h2>
              <Link 
                to="/edit-profile"
                className="px-6 py-2 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Edit Profile
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-center">
                <span className="block text-xl font-bold text-gray-900">{userStats.posts}</span>
                <span className="text-sm text-gray-600">posts</span>
              </div>
              <button className="text-center hover:opacity-80 transition-opacity">
                <span className="block text-xl font-bold text-gray-900">{userStats.followers}</span>
                <span className="text-sm text-gray-600">followers</span>
              </button>
              <button className="text-center hover:opacity-80 transition-opacity">
                <span className="block text-xl font-bold text-gray-900">{userStats.following}</span>
                <span className="text-sm text-gray-600">following</span>
              </button>
            </div>

            {/* Bio */}
            <div>
              <p className="font-bold text-gray-900 mb-1">John Doe</p>
              <p className="text-gray-600 text-sm">Computer Science Student 🎓</p>
              <p className="text-gray-600 text-sm">Love coding, music, and photography 📸</p>
              <p className="text-indigo-600 text-sm mt-1">www.johndoe.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              activeTab === 'posts'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>POSTS</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              activeTab === 'saved'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>SAVED</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tagged')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              activeTab === 'tagged'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>TAGGED</span>
            </div>
          </button>
        </div>

        {/* Posts Grid */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {userPosts.map((post) => (
                <div key={post.id} className="relative aspect-square group cursor-pointer">
                  <img 
                    src={post.imageUrl} 
                    alt="Post" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                    <div className="flex space-x-6 text-white">
                      <span className="flex items-center space-x-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-bold">{post.likes}</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-bold">{post.comments}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'saved' && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-gray-600 font-medium">No saved posts yet</p>
              <p className="text-gray-500 text-sm mt-2">Save posts to see them here</p>
            </div>
          )}
          
          {activeTab === 'tagged' && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-600 font-medium">No tagged posts yet</p>
              <p className="text-gray-500 text-sm mt-2">Photos and videos you're tagged in will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
