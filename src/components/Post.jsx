import React from "react";
import { FaHeart, FaRegHeart, FaLink } from "react-icons/fa";

const Post = ({
  post,
  onLike,
  onCopyLink,
  copiedLink
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center p-4">
        <img
          src={post.user.profilePicture}
          alt={post.user.username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold">{post.user.username}</h3>
          <p className="text-xs text-gray-500">{post.timestamp}</p>
        </div>
      </div>

      {/* Image */}
      <img
        src={post.imageUrl}
        alt="Post"
        className="w-full object-cover"
      />

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center gap-2"
            aria-label={post.liked ? "Unlike post" : "Like post"}
          >
            {post.liked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-700" />
            )}
            <span>{post.likes}</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={() => onCopyLink(post)}
            className="flex items-center gap-2 text-sm text-blue-600"
            aria-label="Copy post link"
          >
            <FaLink />
            {copiedLink === post.id ? "Link Copied" : "Copy Link"}
          </button>
        </div>

        {/* Caption */}
        <p className="mt-3 text-sm">
          <strong>{post.user.username}</strong>{" "}
          {post.caption}
        </p>
      </div>
    </div>
  );
};

export default Post;
