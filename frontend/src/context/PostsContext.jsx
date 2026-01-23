import React, { createContext, useContext, useState, useEffect } from 'react';
import { postsAPI } from '../services/api';

const PostsContext = createContext();

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within PostsProvider');
  }
  return context;
};

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAllPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      const response = await postsAPI.createPost(postData);
      setPosts([response.data, ...posts]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create post' };
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await postsAPI.likePost(postId);
      setPosts(prevPosts => prevPosts.map(post => 
        post._id === postId ? response.data : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const value = {
    posts,
    loading,
    fetchPosts,
    createPost,
    likePost
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
};