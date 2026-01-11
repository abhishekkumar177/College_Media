const STORAGE_KEY = "saved_posts";

// Get saved posts from localStorage
export const getSavedPosts = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

// Check if a post is saved
export const isPostSaved = (postId) => {
  const savedPosts = getSavedPosts();
  return savedPosts.includes(postId);
};

// Toggle save / unsave post
export const toggleSavePost = (postId) => {
  let savedPosts = getSavedPosts();

  if (savedPosts.includes(postId)) {
    savedPosts = savedPosts.filter(id => id !== postId);
  } else {
    savedPosts.push(postId);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPosts));
  return savedPosts;
};
