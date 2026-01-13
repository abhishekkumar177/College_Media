/* eslint-disable react-refresh/only-export-components */
import  { createContext, useContext, useState, useEffect } from "react";

const BookmarkContext = createContext();

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmark must be used within a BookmarkProvider");
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  // Initialize saved posts from localStorage
  const [savedPosts, setSavedPosts] = useState(() => {
    try {
      const saved = localStorage.getItem("savedPosts");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading saved posts:", error);
      return [];
    }
  });

  // Persist saved posts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("savedPosts", JSON.stringify(savedPosts));
    } catch (error) {
      console.error("Error saving posts:", error);
    }
  }, [savedPosts]);

  // Toggle bookmark status for a post
  const toggleBookmark = (postId) => {
    setSavedPosts((prev) => {
      if (prev.includes(postId)) {
        // Remove bookmark
        return prev.filter((id) => id !== postId);
      } else {
        // Add bookmark
        return [...prev, postId];
      }
    });
  };

  // Check if a post is bookmarked
  const isBookmarked = (postId) => {
    return savedPosts.includes(postId);
  };

  // Get count of saved posts
  const getSavedCount = () => {
    return savedPosts.length;
  };

  // Clear all bookmarks
  const clearAllBookmarks = () => {
    setSavedPosts([]);
  };

  const value = {
    savedPosts,
    toggleBookmark,
    isBookmarked,
    getSavedCount,
    clearAllBookmarks,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};
