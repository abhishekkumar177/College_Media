import React, { useState } from 'react';
// Updated imports for React Icons
import { MdPhotoSizeSelectActual, MdVideoLibrary, MdEvent, MdArticle } from "react-icons/md";
import { usePosts } from '../../context/PostsContext';
import { useAuth } from '../../context/AuthContext';

const InputBox = () => {
  const [content, setContent] = useState('');
  const { createPost } = usePosts();
  const { user, isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !isAuthenticated) return;
    
    const result = await createPost({ content });
    if (result.success) {
      setContent('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 text-center">
        <p className="text-gray-500">Please login to create posts</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center space-x-3">
          <img
            src={`https://placehold.co/40x40/3b82f6/ffffff?text=${user?.name?.charAt(0) || 'U'}`}
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <input
            type="text"
            placeholder="Start a post"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            disabled={!content.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex justify-around mt-4 pt-3 border-t border-gray-200">
        <button className="flex flex-col items-center space-y-1 text-blue-600 hover:bg-blue-50 p-2 rounded">
          <MdPhotoSizeSelectActual className="w-6 h-6" />
          <span className="text-xs font-medium">Photo</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-green-600 hover:bg-green-50 p-2 rounded">
          <MdVideoLibrary className="w-6 h-6" />
          <span className="text-xs font-medium">Video</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-orange-600 hover:bg-orange-50 p-2 rounded">
          <MdEvent className="w-6 h-6" />
          <span className="text-xs font-medium">Event</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-red-600 hover:bg-red-50 p-2 rounded">
          <MdArticle className="w-6 h-6" />
          <span className="text-xs font-medium">Write article</span>
        </button>
      </div>
    </div>
  );
};

export default InputBox;