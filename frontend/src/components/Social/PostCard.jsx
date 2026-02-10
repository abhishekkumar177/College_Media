export default function PostCard({ post }) {
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 w-full md:max-w-2xl mx-auto shadow-xs">
      {/* Header: Avatar, Name, Title, Timestamp */}
      <div className="flex items-center mb-3">
        <img
          src={post.user.avatar || '/default-avatar.png'}
          alt={post.user.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold text-sm text-gray-900">{post.user.name}</h3>
          <p className="text-xs text-gray-500">{formatTimestamp(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-800 mb-3 leading-relaxed">{post.content}</p>

      {/* Image */}
      {post.image && (
        <img
          src={`http://localhost:5000${post.image}`}
          alt="Post image"
          className="w-full h-auto rounded-lg mb-3"
        />
      )}

      {/* Engagement Stats */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>{post.likes?.length || 0} likes</span>
        <span>{post.comments?.length || 0} comments</span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-around mt-2 border-t border-gray-100 pt-2">
        <button className="flex items-center text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
          👍 Like
        </button>
        <button className="flex items-center text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
          💬 Comment
        </button>
        <button className="flex items-center text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors">
          🔗 Share
        </button>
      </div>
    </div>
  );
}
