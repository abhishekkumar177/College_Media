import { useContext, useState, useCallback } from 'react';
import CollectionContext from '../context/CollectionContext';

/**
 * Main hook to access collection context
 */
export const useCollections = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollections must be used within a CollectionProvider');
  }
  return context;
};

/**
 * Hook for creating collections
 */
export const useCreateCollection = () => {
  const { createCollection } = useCollections();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (name, description = '', isPublic = false) => {
    setIsCreating(true);
    setError(null);
    try {
      const result = await createCollection(name, description, isPublic);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create collection');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [createCollection]);

  return {
    create,
    isCreating,
    error,
  };
};

/**
 * Hook for managing a single collection
 */
export const useCollection = (collectionId) => {
  const { collections, updateCollection, deleteCollection, loading } = useCollections();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const collection = collections.find(c => c.id === collectionId) || null;

  const update = useCallback(async (updates) => {
    setIsUpdating(true);
    try {
      await updateCollection(collectionId, updates);
    } finally {
      setIsUpdating(false);
    }
  }, [collectionId, updateCollection]);

  const remove = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteCollection(collectionId);
    } finally {
      setIsDeleting(false);
    }
  }, [collectionId, deleteCollection]);

  return {
    collection,
    loading,
    isUpdating,
    isDeleting,
    update,
    remove,
  };
};

/**
 * Hook for post bookmarking
 */
export const useBookmark = (postId) => {
  const { 
    isPostSaved, 
    getCollectionsForPost, 
    togglePostSave,
    addPostToCollection,
    removePostFromCollection 
  } = useCollections();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const isSaved = isPostSaved(postId);
  const savedInCollections = getCollectionsForPost(postId);

  const toggleSave = useCallback(async () => {
    setIsProcessing(true);
    try {
      const newState = await togglePostSave(postId);
      return newState;
    } finally {
      setIsProcessing(false);
    }
  }, [postId, togglePostSave]);

  const saveToCollection = useCallback(async (collectionId) => {
    setIsProcessing(true);
    try {
      await addPostToCollection(collectionId, postId);
    } finally {
      setIsProcessing(false);
    }
  }, [postId, addPostToCollection]);

  const removeFromCollection = useCallback(async (collectionId) => {
    setIsProcessing(true);
    try {
      await removePostFromCollection(collectionId, postId);
    } finally {
      setIsProcessing(false);
    }
  }, [postId, removePostFromCollection]);

  return {
    isSaved,
    savedInCollections,
    isProcessing,
    toggleSave,
    saveToCollection,
    removeFromCollection,
  };
};

/**
 * Hook for collection posts
 */
export const useCollectionPosts = (collectionId) => {
  const { collections } = useCollections();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const collection = collections.find(c => c.id === collectionId);
  const postIds = collection?.postIds || [];

  const loadPosts = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      // In a real implementation, fetch actual post data
      // For now, just use the post IDs
      const start = (pageNum - 1) * 20;
      const end = start + 20;
      const pagePostIds = postIds.slice(start, end);
      
      // Here you would fetch the actual post objects
      // const response = await postsApi.getByIds(pagePostIds);
      // setPosts(prev => pageNum === 1 ? response.data : [...prev, ...response.data]);
      
      setHasMore(end < postIds.length);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading collection posts:', error);
    } finally {
      setLoading(false);
    }
  }, [postIds]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(page + 1);
    }
  }, [loading, hasMore, page, loadPosts]);

  const refresh = useCallback(() => {
    loadPosts(1);
  }, [loadPosts]);

  return {
    posts,
    postIds,
    loading,
    hasMore,
    loadMore,
    refresh,
    postCount: postIds.length,
  };
};

/**
 * Hook for bulk operations
 */
export const useBulkOperations = () => {
  const { bulkRemovePosts, bulkMovePosts } = useCollections();
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSelection = useCallback((postId) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  }, []);

  const selectAll = useCallback((postIds) => {
    setSelectedPosts(postIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPosts([]);
  }, []);

  const removeSelected = useCallback(async (collectionId) => {
    if (selectedPosts.length === 0) return;
    
    setIsProcessing(true);
    try {
      await bulkRemovePosts(collectionId, selectedPosts);
      clearSelection();
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPosts, bulkRemovePosts, clearSelection]);

  const moveSelected = useCallback(async (fromCollectionId, toCollectionId) => {
    if (selectedPosts.length === 0) return;
    
    setIsProcessing(true);
    try {
      await bulkMovePosts(selectedPosts, fromCollectionId, toCollectionId);
      clearSelection();
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPosts, bulkMovePosts, clearSelection]);

  return {
    selectedPosts,
    isProcessing,
    toggleSelection,
    selectAll,
    clearSelection,
    removeSelected,
    moveSelected,
  };
};

/**
 * Hook for collection sorting
 */
export const useCollectionSort = () => {
  const { sortBy, setSortBy, getSortedCollections } = useCollections();

  const sortedCollections = getSortedCollections();

  const changeSortBy = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, [setSortBy]);

  return {
    sortBy,
    sortedCollections,
    changeSortBy,
  };
};

/**
 * Hook for collection search
 */
export const useCollectionSearch = () => {
  const { collections } = useCollections();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollections = searchQuery.trim()
    ? collections.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : collections;

  return {
    searchQuery,
    setSearchQuery,
    filteredCollections,
  };
};

/**
 * Hook for collection statistics
 */
export const useCollectionStats = () => {
  const { collections } = useCollections();

  const totalCollections = collections.length;
  const totalSavedPosts = collections.reduce((sum, c) => sum + (c.postIds?.length || 0), 0);
  const publicCollections = collections.filter(c => c.isPublic).length;
  const privateCollections = collections.filter(c => !c.isPublic).length;

  return {
    totalCollections,
    totalSavedPosts,
    publicCollections,
    privateCollections,
  };
};

export default useCollections;
