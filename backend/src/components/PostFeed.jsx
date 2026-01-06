import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreatePost from './CreatePost';

const PostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockPosts = [
        {
          id: 1,
          user: {
            id: 2,
            username: 'college_friend',
            profilePicture: 'https://placehold.co/40x40/4F46E5/FFFFFF?text=CF'
          },
          imageUrl: 'https://placehold.co/600x600/6366F1/FFFFFF?text=Campus+Life',
          caption: 'Enjoying the beautiful campus weather! 🌞 #college #fun',
          likes: 24,
          comments: 5,
          timestamp: '2 hours ago',
          liked: false
        },
        {
          id: 2,
          user: {
            id: 3,
            username: 'study_buddy',
            profilePicture: 'https://placehold.co/40x40/EC4899/FFFFFF?text=SB'
          },
          imageUrl: 'https://placehold.co/600x600/EC4899/FFFFFF?text=Study+Group',
          caption: 'Group study session in the library! 📚 #study #motivation',
          likes: 42,
          comments: 8,
          timestamp: '4 hours ago',
          liked: true
        },
        {
          id: 3,
          user: {
            id: 4,
            username: 'campus_chef',
            profilePicture: 'https://placehold.co/40x40/10B981/FFFFFF?text=CC'
          },
          imageUrl: 'https://placehold.co/600x600/10B981/FFFFFF?text=Cooking',
          caption: 'Made this amazing dish in the dorm kitchen! 🍳 #cooking #dormlife',
          likes: 18,
          comments: 3,
          timestamp: '6 hours ago',
          liked: false
        }
      ];
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } 
        : post
    ));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
          <div className="h-64 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const [newPosts, setNewPosts] = useState([]);

  const handleNewPost = (post) => {
    setNewPosts(prev => [post, ...prev]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreatePost onPostCreated={handleNewPost} />
      {[...newPosts, ...posts].map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Post Header */}
          <div className="flex items-center p-4">
            <img 
              src={post.user.profilePicture} 
              alt={post.user.username}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{post.user.username}</h3>
              <p className="text-xs text-gray-500">{post.timestamp}</p>
            </div>
          </div>

          {/* Post Image */}
          <div className="relative">
            <img 
              src={post.imageUrl} 
              alt="Post" 
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Post Actions */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center ${post.liked ? 'text-red-500' : 'text-gray-700'}`}
                >
                  <svg 
                    className={`w-6 h-6 ${post.liked ? 'fill-current' : ''}`} 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                <button className="text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button className="text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Likes */}
            <p className="font-semibold text-gray-900 mb-1">{post.likes} likes</p>

            {/* Caption */}
            <div className="mb-2">
              <span className="font-semibold text-gray-900 mr-2">{post.user.username}</span>
              <span className="text-gray-700">{post.caption}</span>
            </div>

            {/* Comments */}
            {post.comments > 0 && (
              <button className="text-gray-500 text-sm mb-2">
                View all {post.comments} comments
              </button>
            )}

            {/* Add Comment */}
            <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border-0 focus:ring-0 text-sm"
              />
              <button className="text-blue-500 font-semibold text-sm">Post</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;