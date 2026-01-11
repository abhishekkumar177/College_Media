import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import {
  useCollection,
  useCollectionPosts,
  useBulkOperations,
  useCollections,
} from '../hooks/useCollections';

/**
 * CollectionDetail Page
 * Individual collection view with posts and infinite scroll
 */
const CollectionDetail = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { collection, loading, isUpdating, update, remove } = useCollection(collectionId);
  const { postIds, loading: postsLoading, hasMore, loadMore, postCount } = useCollectionPosts(collectionId);
  const { selectedPosts, toggleSelection, selectAll, clearSelection, removeSelected, moveSelected, isProcessing } = useBulkOperations();
  const { collections } = useCollections();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPublic, setEditedPublic] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [targetCollectionId, setTargetCollectionId] = useState('');

  useEffect(() => {
    if (collection) {
      setEditedName(collection.name);
      setEditedDescription(collection.description || '');
      setEditedPublic(collection.isPublic || false);
    }
  }, [collection]);

  const handleSaveEdit = async () => {
    if (!editedName.trim()) return;

    await update({
      name: editedName.trim(),
      description: editedDescription.trim(),
      isPublic: editedPublic,
    });

    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${collection.name}"? This cannot be undone.`
    );

    if (confirmed) {
      await remove();
      navigate('/collections');
    }
  };

  const handleBulkRemove = async () => {
    const confirmed = window.confirm(
      `Remove ${selectedPosts.length} post(s) from this collection?`
    );

    if (confirmed) {
      await removeSelected(collectionId);
    }
  };

  const handleBulkMove = async () => {
    if (!targetCollectionId) return;

    await moveSelected(collectionId, targetCollectionId);
    setShowMoveModal(false);
    setTargetCollectionId('');
  };

  const filteredPostIds = searchQuery
    ? postIds.filter(id => id.toLowerCase().includes(searchQuery.toLowerCase()))
    : postIds;

  if (loading && !collection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:folder-off-outline" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Collection not found
          </h2>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <Icon icon="mdi:arrow-left" />
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4"
          >
            <Icon icon="mdi:arrow-left" />
            All Collections
          </Link>

          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedPublic}
                    onChange={(e) => setEditedPublic(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {collection.name}
                    </h1>
                    {collection.isPublic && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                        <Icon icon="mdi:earth" className="w-4 h-4" />
                        Public
                      </span>
                    )}
                  </div>
                  {collection.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {collection.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {postCount} post{postCount !== 1 ? 's' : ''} • Last updated {format(new Date(collection.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    title="Edit collection"
                  >
                    <Icon icon="mdi:pencil" className="w-5 h-5" />
                  </button>
                  {!collection.isDefault && (
                    <button
                      onClick={handleDelete}
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      title="Delete collection"
                    >
                      <Icon icon="mdi:delete" className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Search and Bulk Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex-1 relative">
              <Icon
                icon="mdi:magnify"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in this collection..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedPosts.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkRemove}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                >
                  Remove ({selectedPosts.length})
                </button>
                <button
                  onClick={() => setShowMoveModal(true)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  Move
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  Clear
                </button>
              </div>
            )}

            {selectedPosts.length === 0 && filteredPostIds.length > 0 && (
              <button
                onClick={() => selectAll(filteredPostIds)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Select All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredPostIds.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="mdi:image-off-outline" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No posts found' : 'No posts in this collection'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Start saving posts to this collection'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPostIds.map((postId) => (
                <PostCard
                  key={postId}
                  postId={postId}
                  isSelected={selectedPosts.includes(postId)}
                  onToggleSelect={() => toggleSelection(postId)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={postsLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {postsLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Move Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Move {selectedPosts.length} post(s) to:
            </h3>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {collections
                .filter(c => c.id !== collectionId)
                .map(c => (
                  <button
                    key={c.id}
                    onClick={() => setTargetCollectionId(c.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      targetCollectionId === c.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon icon="mdi:folder" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                  </button>
                ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setTargetCollectionId('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkMove}
                disabled={!targetCollectionId || isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Moving...' : 'Move'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Post Card Component
const PostCard = ({ postId, isSelected, onToggleSelect }) => {
  return (
    <div
      className={`aspect-square relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={onToggleSelect}
    >
      {/* Placeholder for post image */}
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <Icon icon="mdi:image" className="w-12 h-12 text-gray-400" />
      </div>

      {/* Selection Checkbox */}
      <div className="absolute top-2 right-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 group-hover:bg-white'
          }`}
        >
          {isSelected ? (
            <Icon icon="mdi:check" className="w-4 h-4" />
          ) : (
            <div className="w-3 h-3 border-2 border-current rounded-full" />
          )}
        </div>
      </div>

      {/* Post ID Badge (for demo) */}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
        #{postId.slice(-6)}
      </div>
    </div>
  );
};

export default CollectionDetail;