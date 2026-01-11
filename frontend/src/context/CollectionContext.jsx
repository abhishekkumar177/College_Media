import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { collectionsApi } from '../api/endpoints';
import * as collectionStorage from '../utils/collectionStorage';

const CollectionContext = createContext();

export const CollectionProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('alphabetical');

  /**
   * Initialize collections on mount
   */
  useEffect(() => {
    loadCollections();
  }, []);

  /**
   * Load collections from API or localStorage
   */
  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      // Try to fetch from API
      const response = await collectionsApi.getAll();
      setCollections(response.data);
      
      // Sync to localStorage
      collectionStorage.saveCollections(response.data);
    } catch (error) {
      console.error('Error loading collections from API:', error);
      
      // Fallback to localStorage
      const localCollections = collectionStorage.getCollections();
      setCollections(localCollections);
      
      // Ensure default collection exists
      if (localCollections.length === 0) {
        const defaultCollection = collectionStorage.getOrCreateDefaultCollection();
        setCollections([defaultCollection]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new collection
   */
  const createCollection = useCallback(async (name, description = '', isPublic = false) => {
    try {
      // Try API first
      const response = await collectionsApi.create({ name, description, isPublic });
      const newCollection = response.data;
      
      setCollections(prev => [...prev, newCollection]);
      toast.success(`Collection "${name}" created!`);
      
      return newCollection;
    } catch (error) {
      console.error('Error creating collection via API:', error);
      
      // Fallback to localStorage
      const newCollection = collectionStorage.createCollection(name, description, isPublic);
      setCollections(prev => [...prev, newCollection]);
      toast.success(`Collection "${name}" created offline!`);
      
      return newCollection;
    }
  }, []);

  /**
   * Update an existing collection
   */
  const updateCollection = useCallback(async (id, updates) => {
    try {
      const response = await collectionsApi.update(id, updates);
      const updatedCollection = response.data;
      
      setCollections(prev =>
        prev.map(c => c.id === id ? updatedCollection : c)
      );
      
      toast.success('Collection updated!');
      return updatedCollection;
    } catch (error) {
      console.error('Error updating collection:', error);
      
      // Fallback to localStorage
      const updatedCollection = collectionStorage.updateCollection(id, updates);
      if (updatedCollection) {
        setCollections(prev =>
          prev.map(c => c.id === id ? updatedCollection : c)
        );
        toast.success('Collection updated offline!');
        return updatedCollection;
      }
      
      toast.error('Failed to update collection');
      throw error;
    }
  }, []);

  /**
   * Delete a collection
   */
  const deleteCollection = useCallback(async (id) => {
    const collection = collections.find(c => c.id === id);
    
    if (collection?.isDefault) {
      toast.error('Cannot delete the default collection');
      return false;
    }
    
    try {
      await collectionsApi.delete(id);
      
      setCollections(prev => prev.filter(c => c.id !== id));
      toast.success('Collection deleted!');
      
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      
      // Fallback to localStorage
      const success = collectionStorage.deleteCollection(id);
      if (success) {
        setCollections(prev => prev.filter(c => c.id !== id));
        toast.success('Collection deleted offline!');
        return true;
      }
      
      toast.error('Failed to delete collection');
      return false;
    }
  }, [collections]);

  /**
   * Add post to collection
   */
  const addPostToCollection = useCallback(async (collectionId, postId) => {
    try {
      await collectionsApi.addPost(collectionId, postId);
      
      setCollections(prev =>
        prev.map(c =>
          c.id === collectionId
            ? { ...c, postIds: [...(c.postIds || []), postId], updatedAt: new Date().toISOString() }
            : c
        )
      );
      
      const collection = collections.find(c => c.id === collectionId);
      toast.success(`Saved to "${collection?.name || 'collection'}"!`);
      
      return true;
    } catch (error) {
      console.error('Error adding post to collection:', error);
      
      // Fallback to localStorage
      const success = collectionStorage.addPostToCollection(collectionId, postId);
      if (success) {
        setCollections(prev =>
          prev.map(c =>
            c.id === collectionId
              ? { ...c, postIds: [...(c.postIds || []), postId], updatedAt: new Date().toISOString() }
              : c
          )
        );
        
        const collection = collections.find(c => c.id === collectionId);
        toast.success(`Saved to "${collection?.name}" offline!`);
        return true;
      }
      
      toast.error('Failed to save post');
      return false;
    }
  }, [collections]);

  /**
   * Remove post from collection
   */
  const removePostFromCollection = useCallback(async (collectionId, postId) => {
    try {
      await collectionsApi.removePost(collectionId, postId);
      
      setCollections(prev =>
        prev.map(c =>
          c.id === collectionId
            ? { ...c, postIds: (c.postIds || []).filter(id => id !== postId), updatedAt: new Date().toISOString() }
            : c
        )
      );
      
      toast.success('Post removed from collection!');
      return true;
    } catch (error) {
      console.error('Error removing post from collection:', error);
      
      // Fallback to localStorage
      const success = collectionStorage.removePostFromCollection(collectionId, postId);
      if (success) {
        setCollections(prev =>
          prev.map(c =>
            c.id === collectionId
              ? { ...c, postIds: (c.postIds || []).filter(id => id !== postId), updatedAt: new Date().toISOString() }
              : c
          )
        );
        toast.success('Post removed offline!');
        return true;
      }
      
      toast.error('Failed to remove post');
      return false;
    }
  }, []);

  /**
   * Move post between collections
   */
  const movePost = useCallback(async (postId, fromCollectionId, toCollectionId) => {
    await removePostFromCollection(fromCollectionId, postId);
    await addPostToCollection(toCollectionId, postId);
    
    const toCollection = collections.find(c => c.id === toCollectionId);
    toast.success(`Moved to "${toCollection?.name}"!`);
  }, [collections, addPostToCollection, removePostFromCollection]);

  /**
   * Toggle post save (add to default collection if not saved, remove if saved)
   */
  const togglePostSave = useCallback(async (postId) => {
    const defaultCollection = collections.find(c => c.isDefault) || 
                             collections[0] ||
                             collectionStorage.getOrCreateDefaultCollection();
    
    const isSaved = defaultCollection.postIds?.includes(postId);
    
    if (isSaved) {
      await removePostFromCollection(defaultCollection.id, postId);
      return false;
    } else {
      await addPostToCollection(defaultCollection.id, postId);
      return true;
    }
  }, [collections, addPostToCollection, removePostFromCollection]);

  /**
   * Check if post is saved
   */
  const isPostSaved = useCallback((postId) => {
    return collections.some(c => c.postIds?.includes(postId));
  }, [collections]);

  /**
   * Get collections containing a post
   */
  const getCollectionsForPost = useCallback((postId) => {
    return collections.filter(c => c.postIds?.includes(postId));
  }, [collections]);

  /**
   * Get sorted collections
   */
  const getSortedCollections = useCallback(() => {
    return collectionStorage.sortCollections(collections, sortBy);
  }, [collections, sortBy]);

  /**
   * Bulk delete posts from collection
   */
  const bulkRemovePosts = useCallback(async (collectionId, postIds) => {
    try {
      await Promise.all(
        postIds.map(postId => removePostFromCollection(collectionId, postId))
      );
      toast.success(`${postIds.length} post(s) removed!`);
      return true;
    } catch (error) {
      toast.error('Failed to remove some posts');
      return false;
    }
  }, [removePostFromCollection]);

  /**
   * Bulk move posts between collections
   */
  const bulkMovePosts = useCallback(async (postIds, fromCollectionId, toCollectionId) => {
    try {
      await Promise.all(
        postIds.map(postId => movePost(postId, fromCollectionId, toCollectionId))
      );
      toast.success(`${postIds.length} post(s) moved!`);
      return true;
    } catch (error) {
      toast.error('Failed to move some posts');
      return false;
    }
  }, [movePost]);

  const value = {
    // State
    collections,
    loading,
    sortBy,
    
    // Actions
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addPostToCollection,
    removePostFromCollection,
    movePost,
    togglePostSave,
    bulkRemovePosts,
    bulkMovePosts,
    
    // Utilities
    isPostSaved,
    getCollectionsForPost,
    getSortedCollections,
    setSortBy,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollectionContext = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollectionContext must be used within a CollectionProvider');
  }
  return context;
};

export default CollectionContext;
