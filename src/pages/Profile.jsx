import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  const fetchUserProfile = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setProfileData(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Filter posts by current user - Post model uses 'user' field, not 'author'
        const myPosts = data.data.filter(post => {
          const postUserId = post.user?._id || post.user;
          const currentUserId = profileData?._id || user?.id;
          return postUserId?.toString() === currentUserId?.toString();
        });
        setUserPosts(myPosts);
      }
    } catch (err) {
      console.error('Posts fetch error:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchUserPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const displayUser = profileData || user;
  const userStats = {
    posts: displayUser?.postCount || userPosts.length || 0,
    followers: displayUser?.followerCount || 0,
    following: displayUser?.followingCount || 0,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex justify-center md:justify-start">
            <div className="w-32 h-32 md:w-40 md:h-40">
              <img 
                src={displayUser?.profilePicture || `https://ui-avatars.com/api/?name=${displayUser?.username || 'User'}&size=200&background=4F46E5&color=fff&bold=true`}
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border-4 border-gray-100 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            {/* Username and Edit Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayUser?.username || 'User'}</h2>
              <Link 
                to="/edit-profile"
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Edit Profile
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-center">
                <span className="block text-xl font-bold text-gray-900 dark:text-gray-100">{userStats.posts}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">posts</span>
              </div>
              <button className="text-center hover:opacity-80 transition-opacity">
                <span className="block text-xl font-bold text-gray-900 dark:text-gray-100">{userStats.followers}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">followers</span>
              </button>
              <button className="text-center hover:opacity-80 transition-opacity">
                <span className="block text-xl font-bold text-gray-900 dark:text-gray-100">{userStats.following}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">following</span>
              </button>
            </div>

            {/* Bio */}
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                {displayUser?.firstName || displayUser?.lastName 
                  ? `${displayUser?.firstName || ''} ${displayUser?.lastName || ''}`.trim()
                  : displayUser?.username || 'User'}
              </p>
              {displayUser?.bio && (
                <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">{displayUser.bio}</p>
              )}
              {displayUser?.email && (
                <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-1">{displayUser.email}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
              activeTab === 'posts'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
            <>
              {userPosts.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No posts yet</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Start sharing your moments</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-2">
                  {userPosts.map((post) => (
                    <div key={post._id} className="relative aspect-square group cursor-pointer">
                      <img 
                        src={post.imageUrl || post.image || 'https://via.placeholder.com/400'} 
                        alt="Post" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                        <div className="flex space-x-6 text-white">
                          <span className="flex items-center space-x-2">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-bold">{post.likes || post.likeCount || 0}</span>
                          </span>
                          <span className="flex items-center space-x-2">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-bold">{post.comments?.length || post.commentCount || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'saved' && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 font-medium">No saved posts yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Save posts to see them here</p>
            </div>
          )}
          
          {activeTab === 'tagged' && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 font-medium">No tagged posts yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Photos and videos you're tagged in will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
