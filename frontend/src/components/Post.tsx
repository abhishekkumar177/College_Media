import React, { useState } from "react";
import { FaHeart, FaRegHeart, FaLink, FaEllipsisV } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ReportButton from "./ReportButton";
import PollDisplay from "./PollDisplay";
import { usePollByPost } from "../hooks/usePolls";
import ProgressiveImage from "./ProgressiveImage";
import useOptimisticUpdate from "../hooks/useOptimisticUpdate";
import { Post as IPost } from "../types";
import BookmarkButton from "./BookmarkButton";
import { copyPostLink } from "../utils/shareUtils";
import toast from "react-hot-toast";

interface PostProps {
  post: IPost;
  onLike?: (id: string) => Promise<void>;
  onCopyLink: (post: IPost) => void;
  copiedLink: string | null;
}

const Post: React.FC<PostProps> = ({
  post,
  onLike,
  onCopyLink,
  copiedLink
}) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const { poll, hasPoll } = usePollByPost(post.id);

  // Optimistic update for likes
  const { data: likes, isUpdating: isLiking, optimisticUpdate: updateLike } = useOptimisticUpdate({
    initialState: post.likes,
    updateFn: async (newLikes: number) => {
      if (onLike) {
        await onLike(post.id);
      }
      return newLikes;
    },
    optimisticUpdateFn: (currentLikes: number) => post.liked ? currentLikes - 1 : currentLikes + 1,
    errorMessage: t('post.likeError')
  });

  const handleLikeClick = () => {
    // Toggle liked state optimistically
    post.liked = !post.liked;
    updateLike();
  };

  const handleCopyLink = async () => {
    const success = await copyPostLink(
      post,
      (postId) => {
        toast.success(t('post.linkCopied') || 'Link copied to clipboard!');
        setShowMenu(false);
      },
      () => {
        toast.error(t('post.copyLinkError') || 'Failed to copy link. Please try again.');
      }
    );

    if (!success) {
      // Fallback: try to copy using the old method or show error
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        toast.success(t('post.linkCopied') || 'Link copied to clipboard!');
        setShowMenu(false);
      } catch (fallbackError) {
        toast.error(t('post.copyLinkError') || 'Failed to copy link. Please try again.');
      }
    }
  };

  return (
    <div className="bg-bg-secondary rounded-lg shadow-md overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <img
            src={post.user.profilePicture}
            alt={post.user.username}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="font-semibold text-text-primary">{post.user.username}</h3>
            <p className="text-xs text-text-muted">{post.timestamp}</p>
          </div>
        </div>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-bg-tertiary rounded-full transition-colors"
            aria-label={t('post.moreOptions')}
          >
            <FaEllipsisV className="text-text-secondary" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-bg-secondary rounded-lg shadow-lg border border-border py-2 z-20">
                {/* Copy Link Option */}
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors flex items-center gap-2"
                >
                  <FaLink className="w-4 h-4" />
                  {t('post.copyLink') || 'Copy Link'}
                </button>

                {/* Divider */}
                <div className="border-t border-border my-1"></div>

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
        <ProgressiveImage
          src={post.imageUrl}
          placeholder={post.thumbnailUrl}
          alt={`Post by ${post.user.username}`}
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
            onClick={handleLikeClick}
            className="flex items-center gap-2"
            aria-label={post.liked ? t('post.unlike') : t('post.like')}
            disabled={isLiking}
          >
            {post.liked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-text-secondary" />
            )}
            <span className={isLiking ? 'opacity-70 text-text-primary' : 'text-text-primary'}>{likes}</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={() => onCopyLink(post)}
            className="flex items-center gap-2 text-sm text-brand-primary"
            aria-label={t('post.copyLink')}
          >
            <FaLink />
            {copiedLink === post.id ? t('post.linkCopied') : t('post.copyLink')}
          </button>

          <div className="ml-auto">
            <BookmarkButton postId={post.id} />
          </div>
        </div>

        {/* Caption */}
        <p className="mt-3 text-sm text-text-primary">
          <strong className="text-text-primary">{post.user.username}</strong>{" "}
          <span className="text-text-secondary">{post.caption}</span>
        </p>
      </div>
    </div>
  );
};

export default Post;
