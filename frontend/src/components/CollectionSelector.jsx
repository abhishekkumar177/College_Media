import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useCollections, useCreateCollection } from '../hooks/useCollections';

/**
 * CollectionSelector Component
 * Dropdown for selecting a collection when saving a post
 */
const CollectionSelector = ({ postId, onClose, onSelect }) => {
  const { collections, addPostToCollection } = useCollections();
  const { create, isCreating } = useCreateCollection();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollections = searchQuery.trim()
    ? collections.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : collections;

  const handleSelectCollection = async (collectionId) => {
    await addPostToCollection(collectionId, postId);
    onSelect?.(collectionId);
    onClose();
  };

  const handleCreateAndSave = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const newCollection = await create(newCollectionName.trim());
      await addPostToCollection(newCollection.id, postId);
      onSelect?.(newCollection.id);
      onClose();
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Save to Collection
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCollections.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            {searchQuery ? 'No collections found' : 'No collections yet'}
          </div>
        ) : (
          filteredCollections.map((collection) => {
            const isPostInCollection = collection.postIds?.includes(postId);
            
            return (
              <button
                key={collection.id}
                onClick={() => handleSelectCollection(collection.id)}
                disabled={isPostInCollection}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  isPostInCollection
                    ? 'bg-blue-50 dark:bg-blue-900/20 cursor-not-allowed'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon
                    icon={collection.isPublic ? 'mdi:folder-open' : 'mdi:folder'}
                    className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {collection.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {collection.postIds?.length || 0} post{collection.postIds?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {isPostInCollection && (
                  <Icon
                    icon="mdi:check-circle"
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Create New Collection */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        {showCreateForm ? (
          <form onSubmit={handleCreateAndSave} className="space-y-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              autoFocus
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCollectionName('');
                }}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newCollectionName.trim() || isCreating}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create & Save'
                )}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" />
            <span>Create New Collection</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CollectionSelector;
