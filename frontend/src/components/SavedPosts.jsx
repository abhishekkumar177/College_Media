import React from 'react';
import { useBookmark } from '../context/BookmarkContext';
import { useAuth } from '../context/AuthContext';

/**
 * SavedPosts Component
 * 
 * Displays all posts that the user has bookmarked
 * Shows an empty state when no posts are saved
 * 
 * @param {Object} props - Component props
 * @param {Array} props.posts - Array of all available posts
 * @returns {React.ReactElement} Saved posts view
 */
const SavedPosts = ({ posts = [] }) => {
  const { savedPosts, toggleBookmark, isBookmarked } = useBookmark();
  const { user } = useAuth();

  // Filter posts to show only saved ones
  const bookmarkedPosts = posts.filter(post => savedPosts.includes(post.id));

  const handleLike = (postId) => {
    // This would typically update the like state
    // For now, we'll just log it
    console.log('Like toggled for post:', postId);
  };

  // Empty state when no saved posts
  if (bookmarkedPosts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="mb-6">
            <svg 
              className="w-24 h-24 mx-auto text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No saved posts yet</h3>
          <p className="text-gray-500 mb-6">
            Posts you bookmark will appear here for easy access later
          </p>
          <a 
            href="/home" 
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Posts
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Saved Posts
          <span className="ml-2 text-lg text-gray-500">({bookmarkedPosts.length})</span>
        </h2>
        <p className="text-gray-600 mt-1">Your bookmarked posts</p>
      </div>

      {/* Saved Posts List */}
      <div className="space-y-6">
        {bookmarkedPosts.map((post) => (
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
                  {/* Like Button */}
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

                  {/* Comment Button */}
                  <button className="text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>

                  {/* Share Button */}
                  <button className="text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>

                {/* Bookmark Button - Already saved */}
                <button 
                  onClick={() => toggleBookmark(post.id)}
                  className="bookmark-btn bookmarked"
                  title="Remove from saved"
                >
                  <svg 
                    className="w-6 h-6 fill-current" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                </button>
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
    </div>
  );
};

export default SavedPosts;
