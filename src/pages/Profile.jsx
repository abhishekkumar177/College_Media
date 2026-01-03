import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [userStats, setUserStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });
  
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          // Set stats from user object
          setUserStats({
            posts: user.postCount || 0,
            followers: user.followerCount || 0,
            following: user.followingCount || 0
          });
          
          // In a real app, fetch user's posts from API
          // const postsResponse = await fetch(`/api/users/${user.id}/posts`, {
          //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          // });
          // const postsData = await postsResponse.json();
          // setUserPosts(postsData.posts);
          
          // For now, we'll use mock data
          setUserPosts([
            { id: 1, imageUrl: 'https://placehold.co/600x600/FF6B6B/FFFFFF?text=Post+1', likes: 12 },
            { id: 2, imageUrl: 'https://placehold.co/600x600/4ECDC4/FFFFFF?text=Post+2', likes: 24 },
            { id: 3, imageUrl: 'https://placehold.co/600x600/45B7D1/FFFFFF?text=Post+3', likes: 8 },
            { id: 4, imageUrl: 'https://placehold.co/600x600/96CEB4/FFFFFF?text=Post+4', likes: 32 },
            { id: 5, imageUrl: 'https://placehold.co/600x600/FFEAA7/FFFFFF?text=Post+5', likes: 17 },
            { id: 6, imageUrl: 'https://placehold.co/600x600/DDA0DD/FFFFFF?text=Post+6', likes: 5 },
          ]);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  return (
    <div className="profile-container">
      <div className="profile-header p-6">
        <div className="flex flex-col items-center mb-6">
          <img 
            src={user?.profilePicture || 'https://placehold.co/150x150/FF6B6B/FFFFFF?text=U'} 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-300 mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">{user?.username || 'username'}</h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{userStats.posts}</p>
              <p className="text-gray-600">posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{userStats.followers}</p>
              <p className="text-gray-600">followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">{userStats.following}</p>
              <p className="text-gray-600">following</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => navigate('/profile/edit')} 
              className="px-6 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </button>
            <button 
              onClick={logout}
              className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Full Name'}</h2>
          <p className="text-gray-600">{user?.bio || 'Bio not set'}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-center space-x-8 mb-6">
          <button className="pb-2 border-b-2 border-black text-black font-semibold">
            Posts
          </button>
          <button className="pb-2 text-gray-500 hover:text-gray-700">
            Reels
          </button>
          <button className="pb-2 text-gray-500 hover:text-gray-700">
            Tagged
          </button>
        </div>
        
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {userPosts.map(post => (
              <div key={post.id} className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                <img 
                  src={post.imageUrl} 
                  alt="Post" 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No posts yet. Start sharing your college life!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
