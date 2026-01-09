import React, { useState, useEffect } from 'react';
import SavedPosts from '../components/SavedPosts';
import SEO from '../components/Seo';
import { mockPosts } from '../data/post';

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
