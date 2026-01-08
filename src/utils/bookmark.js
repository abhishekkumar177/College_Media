const BOOKMARK_KEY = "saved_posts";

export const getSavedPosts = () => {
  return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
};

export const isPostSaved = (postId) => {
  return getSavedPosts().includes(postId);
};

export const toggleSavePost = (postId) => {
  let saved = getSavedPosts();

  if (saved.includes(postId)) {
    saved = saved.filter((id) => id !== postId);
  } else {
    saved.push(postId);
  }

  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(saved));
  return saved;
};
