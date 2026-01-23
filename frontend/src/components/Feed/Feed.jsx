import React from 'react';
import InputBox from './InputBox';
import Post from './Post';
import { usePosts } from '../../context/PostsContext';

const Feed = () => {
  const { posts, loading } = usePosts();

  if (loading) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-4">
        <InputBox />
        <div className="text-center py-8">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto px-4">
      <InputBox />
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map(post => (
            <Post
              key={post._id}
              post={post}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;