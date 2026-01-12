import React, { useState, useEffect } from "react";
import { commentsApi } from "../api/endpoints";
import { useTheme } from "../context/ThemeContext";
import useTypingIndicator from "../hooks/useTypingIndicator";
import useFocusTrap from "../hooks/useFocusTrap";
import useOptimisticUpdate from "../hooks/useOptimisticUpdate";
import TypingIndicator from "./TypingIndicator";
import useContentModeration from "../hooks/useContentModeration";
import ModerationWarning from "./ModerationWarning";

const CommentModal = ({ isOpen, onClose, postId, commentCount }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { modalRef } = useFocusTrap(isOpen, onClose);

  // Optimistic update for comments
  const { data: optimisticComments, optimisticUpdate: addOptimisticComment } = useOptimisticUpdate({
    initialState: comments,
    updateFn: async (newComments) => {
      // The actual API call is handled in handlePostComment
      return newComments;
    },
    optimisticUpdateFn: (currentComments) => {
      // Add temporary comment with optimistic data
      const tempComment = {
        id: `temp-${Date.now()}`,
        content: newComment,
        user: { username: 'You' }, // Placeholder - should use actual user data
        timestamp: 'Just now',
        isOptimistic: true
      };
      return [...currentComments, tempComment];
    },
    errorMessage: 'Failed to post comment. Please try again.'
  });

  const { analyze, bypass, resetModeration, warnings } = useContentModeration();
  const [showModerationModal, setShowModerationModal] = useState(false);

  // Mock user data (replace with actual user context)
  const currentUser = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    username: 'You'
  };

  // Typing indicator (socket will be null for now, simulating without backend)
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(
    postId,
    currentUser.id,
    currentUser.username,
    null // Socket instance - pass actual socket when available
  );

  // This effect runs every time the postId changes, 
  // ensuring comments stay synced with the visible reel.
  useEffect(() => {
    if (isOpen && postId) {
      setComments([]); // Clear previous comments immediately for better UX
      fetchComments();
    }

    // Stop typing when modal closes
    return () => {
      if (isOpen) {
        stopTyping();
      }
    };
  }, [isOpen, postId]); //

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await commentsApi.getByPost(postId);
      const fetchedComments = response?.data?.data || [];
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);

    // Trigger typing indicator
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const executePostComment = async () => {
    // Stop typing indicator
    stopTyping();

    try {
      // Add optimistic comment
      await addOptimisticComment();

      // Make actual API call
      const response = await commentsApi.create(postId, { content: commentText });
      if (response?.data) {
        const addedComment = response.data.data || response.data;
        setComments((prev) => [...prev, addedComment]);
        setNewComment("");
        resetModeration();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setNewComment(commentText); // Restore comment text on error
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { isClean } = analyze(newComment);

    if (!isClean) {
      setShowModerationModal(true);
      stopTyping(); // Stop typing while they decide
      return;
    }

    await executePostComment();
  };

  const handleModerationBypass = () => {
    bypass();
    setShowModerationModal(false);
    executePostComment();
  };

  const handleModerationEdit = () => {
    setShowModerationModal(false);
    resetModeration();
    // Potentially restart typing if they focus back, but for now just close modal
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-0 right-0 z-[1000] h-full w-full lg:w-[450px] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b dark:border-slate-800 border-gray-100">
        <div>
          <h3 id="modal-title" className="text-xl font-bold">Comments</h3>
          <p className="text-sm text-gray-500">{commentCount} responses</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Comments List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-20 text-gray-500"><p>No comments yet.</p></div>
        ) : (
          comments.map((comment, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shrink-0" />
              <div className="flex-1">
                <div className={`p-4 rounded-2xl rounded-tl-none ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <p className="text-sm font-bold text-purple-600">@{comment.user?.username || "user"}</p>
                  <p className="text-sm mt-1 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t dark:border-slate-800 border-gray-100">
        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        <div className="p-6">
          <form onSubmit={handlePostComment} className="flex flex-col gap-3">
            <textarea
              value={newComment}
              onChange={handleCommentChange}
              onBlur={stopTyping}
              placeholder="Write a comment..."
              className={`w-full p-4 h-24 rounded-2xl resize-none outline-none border-none text-sm ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}
            />
            <div className="flex justify-end">
              <button type="submit" disabled={!newComment.trim()} className="bg-purple-600 text-white px-8 py-2.5 rounded-full font-bold transition-all disabled:opacity-30">
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      <ModerationWarning
        isOpen={showModerationModal}
        onClose={handleModerationEdit}
        onBypass={handleModerationBypass}
        warnings={warnings}
      />
    </div>
  );
};

export default CommentModal;