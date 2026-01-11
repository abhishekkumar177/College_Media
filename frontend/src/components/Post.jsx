import React, { useState } from "react";
import { FaHeart, FaRegHeart, FaLink, FaEllipsisV } from "react-icons/fa";
import ReportButton from "./ReportButton";
import PollDisplay from "./PollDisplay";
import { usePollByPost } from "../hooks/usePolls";

const Post = ({
  post,
  onLike,
  onCopyLink,
  copiedLink
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { poll, hasPoll } = usePollByPost(post.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
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
        
        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="More options"
          >
            <FaEllipsisV className="text-gray-600" />
          </button>
          
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <ReportButton
                  contentType="post"
                  contentId={post.id}
                  contentOwnerId={post.user.id}
                  onReportSubmitted={() => setShowMenu(false)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full object-cover"
        />
      )}

      {/* Poll */}
      {(hasPoll || post.poll) && (
        <div className="px-4">
          <PollDisplay poll={poll || post.poll} />
        </div>
      )}

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
