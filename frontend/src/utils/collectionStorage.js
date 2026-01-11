/**
 * Collection Storage Utilities
 * localStorage utilities for offline collection support
 */

const COLLECTIONS_KEY = 'college_media_collections';
const SAVED_POSTS_KEY = 'college_media_saved_posts';

/**
 * Get all collections from localStorage
 */
export const getCollections = () => {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading collections:', error);
    return [];
  }
};

/**
 * Save collections to localStorage
 */
export const saveCollections = (collections) => {
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    return true;
  } catch (error) {
    console.error('Error saving collections:', error);
    return false;
  }
};

/**
 * Get collection by ID
 */
export const getCollectionById = (id) => {
  const collections = getCollections();
  return collections.find(c => c.id === id) || null;
};

/**
 * Create a new collection
 */
export const createCollection = (name, description = '', isPublic = false) => {
  const collections = getCollections();
  
  const newCollection = {
    id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    isPublic,
    postIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  collections.push(newCollection);
  saveCollections(collections);
  
  return newCollection;
};

/**
 * Update an existing collection
 */
export const updateCollection = (id, updates) => {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  collections[index] = {
    ...collections[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveCollections(collections);
  return collections[index];
};

/**
 * Delete a collection
 */
export const deleteCollection = (id) => {
  const collections = getCollections();
  const filtered = collections.filter(c => c.id !== id);
  
  if (filtered.length === collections.length) return false;
  
  saveCollections(filtered);
  return true;
};

/**
 * Add post to collection
 */
export const addPostToCollection = (collectionId, postId) => {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === collectionId);
  
  if (index === -1) return false;
  
  if (!collections[index].postIds.includes(postId)) {
    collections[index].postIds.push(postId);
    collections[index].updatedAt = new Date().toISOString();
    saveCollections(collections);
  }
  
  // Also update saved posts mapping
  addToSavedPosts(postId, collectionId);
  
  return true;
};

/**
 * Remove post from collection
 */
export const removePostFromCollection = (collectionId, postId) => {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === collectionId);
  
  if (index === -1) return false;
  
  collections[index].postIds = collections[index].postIds.filter(id => id !== postId);
  collections[index].updatedAt = new Date().toISOString();
  saveCollections(collections);
  
  // Also update saved posts mapping
  removeFromSavedPosts(postId, collectionId);
  
  return true;
};

/**
 * Move post between collections
 */
export const movePostBetweenCollections = (postId, fromCollectionId, toCollectionId) => {
  removePostFromCollection(fromCollectionId, postId);
  addPostToCollection(toCollectionId, postId);
  return true;
};

/**
 * Check if post is in collection
 */
export const isPostInCollection = (collectionId, postId) => {
  const collection = getCollectionById(collectionId);
  return collection ? collection.postIds.includes(postId) : false;
};

/**
 * Get all collections containing a post
 */
export const getCollectionsForPost = (postId) => {
  const collections = getCollections();
  return collections.filter(c => c.postIds.includes(postId));
};

/**
 * Get saved posts mapping (postId -> collectionIds)
 */
export const getSavedPosts = () => {
  try {
    const stored = localStorage.getItem(SAVED_POSTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading saved posts:', error);
    return {};
  }
};

/**
 * Add to saved posts mapping
 */
export const addToSavedPosts = (postId, collectionId) => {
  const savedPosts = getSavedPosts();
  
  if (!savedPosts[postId]) {
    savedPosts[postId] = [];
  }
  
  if (!savedPosts[postId].includes(collectionId)) {
    savedPosts[postId].push(collectionId);
  }
  
  try {
    localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(savedPosts));
  } catch (error) {
    console.error('Error updating saved posts:', error);
  }
};

/**
 * Remove from saved posts mapping
 */
export const removeFromSavedPosts = (postId, collectionId) => {
  const savedPosts = getSavedPosts();
  
  if (savedPosts[postId]) {
    savedPosts[postId] = savedPosts[postId].filter(id => id !== collectionId);
    
    if (savedPosts[postId].length === 0) {
      delete savedPosts[postId];
    }
  }
  
  try {
    localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(savedPosts));
  } catch (error) {
    console.error('Error updating saved posts:', error);
  }
};

/**
 * Check if post is saved in any collection
 */
export const isPostSaved = (postId) => {
  const savedPosts = getSavedPosts();
  return savedPosts[postId] && savedPosts[postId].length > 0;
};

/**
 * Get or create default "Saved" collection
 */
export const getOrCreateDefaultCollection = () => {
  const collections = getCollections();
  let defaultCollection = collections.find(c => c.name === 'Saved' && c.isDefault);
  
  if (!defaultCollection) {
    defaultCollection = {
      id: `col_default_${Date.now()}`,
      name: 'Saved',
      description: 'Your saved posts',
      isPublic: false,
      isDefault: true,
      postIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    collections.unshift(defaultCollection);
    saveCollections(collections);
  }
  
  return defaultCollection;
};

/**
 * Sort collections
 */
export const sortCollections = (collections, sortBy = 'alphabetical') => {
  const sorted = [...collections];
  
  switch (sortBy) {
    case 'alphabetical':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'dateCreated':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'mostPosts':
      sorted.sort((a, b) => b.postIds.length - a.postIds.length);
      break;
    case 'recentlyUpdated':
      sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      break;
    default:
      break;
  }
  
  return sorted;
};

/**
 * Search collections by name
 */
export const searchCollections = (query) => {
  const collections = getCollections();
  const lowerQuery = query.toLowerCase();
  
  return collections.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Clear all collections (use with caution)
 */
export const clearAllCollections = () => {
  try {
    localStorage.removeItem(COLLECTIONS_KEY);
    localStorage.removeItem(SAVED_POSTS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing collections:', error);
    return false;
  }
};

/**
 * Export collections data
 */
export const exportCollections = () => {
  return {
    collections: getCollections(),
    savedPosts: getSavedPosts(),
    exportedAt: new Date().toISOString(),
  };
};

/**
 * Import collections data
 */
export const importCollections = (data) => {
  try {
    if (data.collections) {
      saveCollections(data.collections);
    }
    if (data.savedPosts) {
      localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(data.savedPosts));
    }
    return true;
  } catch (error) {
    console.error('Error importing collections:', error);
    return false;
  }
};
