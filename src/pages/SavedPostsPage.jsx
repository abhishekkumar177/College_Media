import React, { useState, useEffect } from 'react';
import SavedPosts from '../components/SavedPosts';
import SEO from '../components/Seo';

/**
 * SavedPostsPage Component
 * 
 * Page wrapper for the SavedPosts component
 * Fetches all posts and passes them to SavedPosts for filtering
 */
const SavedPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get all posts
    // In a real app, this would fetch from your backend
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
        },
        {
          id: 4,
          user: {
            id: 5,
            username: 'sports_fan',
            profilePicture: 'https://placehold.co/40x40/F59E0B/FFFFFF?text=SF'
          },
          imageUrl: 'https://placehold.co/600x600/F59E0B/FFFFFF?text=Sports',
          caption: 'Game day! Let\'s go team! 🏀 #sports #college',
          likes: 56,
          comments: 12,
          timestamp: '8 hours ago',
          liked: true
        }
      ];
      setPosts(mockPosts);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
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

  return (
    <>
      <SEO 
        title="Saved Posts - CollegeMedia"
        description="View all your saved posts"
        keywords="saved posts, bookmarks, college media"
      />
      <SavedPosts posts={posts} />
    </>
  );
};

export default SavedPostsPage;
