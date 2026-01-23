import React from 'react';
// Updated imports for React Icons
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FiSend } from "react-icons/fi";
import { usePosts } from '../../context/PostsContext';
import { useAuth } from '../../context/AuthContext';

const Post = ({ post }) => {
  const { likePost } = usePosts();
  const { user } = useAuth();
  
  const isLiked = post.likes?.includes(user?.id);
  const likesCount = post.likes?.length || 0;
  
  const handleLike = () => {
    if (user) {
      likePost(post._id);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-start space-x-3">
        <img 
          src={`https://placehold.co/40x40/3b82f6/ffffff?text=${encodeURIComponent(post.user?.name?.charAt(0) || 'U')}`} 
          alt={post.user?.name || 'User'} 
          className="w-10 h-10 rounded-full"
          onError={(e) => {
            e.target.src = 'https://placehold.co/40x40/gray/ffffff?text=U';
          }}
        />
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{post.user?.name}</h4>
          <p className="text-gray-500 text-sm">{post.user?.email}</p>
          <p className="text-gray-400 text-xs">{formatDate(post.createdAt)}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-gray-800">{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="mt-3 rounded-lg max-w-full" />
        )}
      </div>

      {likesCount > 0 && (
        <div className="mt-3 text-sm text-gray-500">
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </div>
      )}

      <div className="flex justify-around mt-4 pt-3 border-t border-gray-200">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 ${isLiked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
        >
          {isLiked ? <AiFillLike className="w-5 h-5" /> : <AiOutlineLike className="w-5 h-5" />}
          <span className="text-sm font-medium">Like</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
          <FaRegCommentDots className="w-5 h-5" />
          <span className="text-sm font-medium">Comment</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
          <BiRepost className="w-5 h-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
          <FiSend className="w-5 h-5" />
          <span className="text-sm font-medium">Send</span>
        </button>
      </div>
    </div>
  );
};

export default Post;