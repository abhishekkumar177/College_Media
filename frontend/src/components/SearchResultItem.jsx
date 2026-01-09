import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getHighlightedExcerpt } from '../utils/searchHighlight';

const SearchResultItem = ({ result, query }) => {
  const getResultIcon = (type) => {
    const icons = {
      post: { icon: 'mdi:file-document', color: 'text-green-500' },
      user: { icon: 'mdi:account', color: 'text-blue-500' },
      comment: { icon: 'mdi:comment', color: 'text-purple-500' },
    };
    return icons[type] || icons.post;
  };

  const iconData = getResultIcon(result.type);

  if (result.type === 'user') {
    return (
      <Link
        to={`/profile/${result.username}`}
        className="block bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
      >
        <div className="flex items-center gap-4">
          <img
            src={result.avatar || 'https://placehold.co/100x100/4A90E2/FFFFFF?text=U'}
            alt={result.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {result.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">@{result.username}</p>
            {result.bio && (
              <p
                className="text-sm text-gray-700 dark:text-gray-300 mt-1"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedExcerpt(result.bio, query, 100),
                }}
              />
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{result.followers || 0} followers</span>
              <span>{result.posts || 0} posts</span>
            </div>
          </div>
          <Icon icon="mdi:chevron-right" width={24} className="text-gray-400" />
        </div>
      </Link>
    );
  }

  if (result.type === 'post') {
    return (
      <Link
        to={`/post/${result.id}`}
        className="block bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
      >
        <div className="flex gap-4">
          <div className={`flex-shrink-0 ${iconData.color}`}>
            <Icon icon={iconData.icon} width={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {result.author && (
                <>
                  <img
                    src={result.author.avatar || 'https://placehold.co/40x40'}
                    alt={result.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {result.author.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    @{result.author.username}
                  </span>
                </>
              )}
            </div>
            {result.title && (
              <h3
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedExcerpt(result.title, query, 80),
                }}
              />
            )}
            {result.content && (
              <p
                className="text-gray-700 dark:text-gray-300 mb-3"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedExcerpt(result.content, query, 200),
                }}
              />
            )}
            {result.image && (
              <img
                src={result.image}
                alt="Post"
                className="w-full max-h-64 object-cover rounded-lg mb-3"
              />
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Icon icon="mdi:heart" width={16} />
                {result.likes || 0}
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="mdi:comment" width={16} />
                {result.comments || 0}
              </span>
              {result.createdAt && (
                <span>{new Date(result.createdAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (result.type === 'comment') {
    return (
      <Link
        to={`/post/${result.postId}#comment-${result.id}`}
        className="block bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
      >
        <div className="flex gap-4">
          <div className={`flex-shrink-0 ${iconData.color}`}>
            <Icon icon={iconData.icon} width={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {result.author && (
                <>
                  <img
                    src={result.author.avatar || 'https://placehold.co/40x40'}
                    alt={result.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {result.author.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">commented</span>
                </>
              )}
            </div>
            <p
              className="text-gray-700 dark:text-gray-300 mb-2"
              dangerouslySetInnerHTML={{
                __html: getHighlightedExcerpt(result.content, query, 200),
              }}
            />
            {result.postTitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                on: {result.postTitle}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span className="flex items-center gap-1">
                <Icon icon="mdi:heart" width={16} />
                {result.likes || 0}
              </span>
              {result.createdAt && (
                <span>{new Date(result.createdAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return null;
};

export default SearchResultItem;
