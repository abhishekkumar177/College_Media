import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import {
  useCollections,
  useCollectionSort,
  useCollectionSearch,
  useCollectionStats,
  useCreateCollection,
} from '../hooks/useCollections';

/**
 * Collections Page
 * Grid view of all user collections with stats
 */
const Collections = () => {
  const navigate = useNavigate();
  const { loading, deleteCollection } = useCollections();
  const { sortBy, sortedCollections, changeSortBy } = useCollectionSort();
  const { searchQuery, setSearchQuery, filteredCollections } = useCollectionSearch();
  const { totalCollections, totalSavedPosts } = useCollectionStats();
  const { create, isCreating } = useCreateCollection();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const displayCollections = searchQuery ? filteredCollections : sortedCollections;

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const collection = await create(
        newCollectionName.trim(),
        newCollectionDescription.trim(),
        newCollectionPublic
      );
      
      // Reset form
      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionPublic(false);
      setShowCreateModal(false);

      // Navigate to the new collection
      navigate(`/collections/${collection.id}`);
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleDeleteCollection = async (collectionId, collectionName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${collectionName}"? This cannot be undone.`
    );

    if (confirmed) {
      await deleteCollection(collectionId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon icon="mdi:bookmark-multiple" className="w-8 h-8" />
                My Collections
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {totalCollections} collection{totalCollections !== 1 ? 's' : ''} • {totalSavedPosts} saved post{totalSavedPosts !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              New Collection
            </button>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Icon
                icon="mdi:magnify"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => changeSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="dateCreated">Date Created</option>
              <option value="mostPosts">Most Posts</option>
              <option value="recentlyUpdated">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && displayCollections.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : displayCollections.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="mdi:bookmark-outline" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No collections found' : 'No collections yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Create your first collection to start organizing your saved posts'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Icon icon="mdi:plus" className="w-5 h-5" />
                Create Collection
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onDelete={handleDeleteCollection}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Collection
              </h2>

              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g., Design Inspiration"
                    maxLength={50}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    placeholder="What's this collection about?"
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publicCheckbox"
                    checked={newCollectionPublic}
                    onChange={(e) => setNewCollectionPublic(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="publicCheckbox" className="text-sm text-gray-700 dark:text-gray-300">
                    Make this collection public
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newCollectionName.trim() || isCreating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Collection'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Collection Card Component
const CollectionCard = ({ collection, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <Link
      to={`/collections/${collection.id}`}
      className="block group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Thumbnail Preview (first 4 posts) */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        {collection.postIds && collection.postIds.length > 0 ? (
          <div className="grid grid-cols-2 gap-0.5 h-full">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-600 flex items-center justify-center"
              >
                {i < collection.postIds.length ? (
                  <Icon icon="mdi:image" className="w-8 h-8 text-gray-400" />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icon icon="mdi:folder-open-outline" className="w-16 h-16 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        
        {/* Privacy Badge */}
        {collection.isPublic && (
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <Icon icon="mdi:earth" className="w-4 h-4 text-white" />
            <span className="text-xs text-white">Public</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {collection.name}
          </h3>
          {!collection.isDefault && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(collection.id, collection.name);
              }}
              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <Icon icon="mdi:delete-outline" className="w-5 h-5" />
            </button>
          )}
        </div>

        {collection.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {collection.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{collection.postIds?.length || 0} posts</span>
          {collection.updatedAt && (
            <span>{format(new Date(collection.updatedAt), 'MMM d, yyyy')}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Collections;