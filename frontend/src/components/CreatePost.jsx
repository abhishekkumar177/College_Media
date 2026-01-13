import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useCreatePoll } from '../hooks/usePolls';
import PollCreator from './PollCreator';
import useContentModeration from '../hooks/useContentModeration';
import ModerationWarning from './ModerationWarning';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { createPoll } = useCreatePoll();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollData, setPollData] = useState(null);

  const { analyze, bypass, resetModeration, warnings } = useContentModeration();
  const [showModerationModal, setShowModerationModal] = useState(false);

  // Character counter configuration
  const maxLength = 500;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptionChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxLength) {
      setCaption(text);
    }
  };

  const executePostCreation = async () => {
    setIsCreating(true);

    // Create poll if poll data exists
    let createdPoll = null;
    if (pollData) {
      createdPoll = await createPoll({
        ...pollData,
        postId: Date.now(), // Temporary ID, should be actual post ID from backend
      });
    }

    // In a real app, this would be an API call to create a post
    // For now, we'll simulate the creation
    setTimeout(() => {
      const newPost = {
        id: Date.now(),
        user: {
          id: user._id,
          username: user.username,
          profilePicture: user.profilePicture
        },
        imageUrl: imagePreview || (pollData ? null : 'https://placehold.co/600x600/6366F1/FFFFFF?text=New+Post'),
        caption: caption,
        likes: 0,
        comments: 0,
        timestamp: 'Just now',
        liked: false,
        poll: createdPoll || null
      };

      onPostCreated && onPostCreated(newPost);
      setCaption('');
      setImage(null);
      setImagePreview(null);
      setPollData(null);
      setShowPollCreator(false);
      setIsCreating(false);
      resetModeration();
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !image && !pollData) return;

    // Content Moderation check
    // We check caption and poll question if it exists
    const textToCheck = [caption, pollData?.question].filter(Boolean).join(' ');
    const { isClean } = analyze(textToCheck);

    if (!isClean) {
      setShowModerationModal(true);
      return;
    }

    await executePostCreation();
  };

  const handleModerationBypass = () => {
    bypass();
    setShowModerationModal(false);
    executePostCreation();
  };

  const handleModerationEdit = () => {
    setShowModerationModal(false);
    resetModeration(); // Reset so they can try again
  };

  const handlePollCreate = (poll) => {
    setPollData(poll);
    setShowPollCreator(false);
  };

  const handleRemovePoll = () => {
    setPollData(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <img
            src={user?.profilePicture || 'https://placehold.co/40x40/FF6B6B/FFFFFF?text=U'}
            alt={user?.username}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{user?.username}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={caption}
            onChange={handleCaptionChange}
            placeholder="What's happening?"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows="3"
            maxLength={maxLength}
          />

          {/* Character Counter */}
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs ${caption.length >= maxLength
                  ? 'text-red-600 font-bold'
                  : caption.length > maxLength * 0.8
                    ? 'text-yellow-600 font-medium'
                    : 'text-gray-500'
                }`}
            >
              {caption.length} / {maxLength}
            </span>
          </div>

          {imagePreview && (
            <div className="mt-3 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          {/* Poll Creator */}
          {showPollCreator && (
            <div className="mt-3">
              <PollCreator
                onPollCreate={handlePollCreate}
                onCancel={() => setShowPollCreator(false)}
              />
            </div>
          )}

          {/* Poll Preview */}
          {pollData && !showPollCreator && (
            <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Icon icon="mdi:poll" className="text-indigo-500 text-xl" />
                  <div>
                    <p className="font-medium text-gray-900">{pollData.question}</p>
                    <p className="text-sm text-gray-600">
                      {pollData.options.length} options • {pollData.duration && pollData.durationUnit ? `${pollData.duration} ${pollData.durationUnit}` : 'No expiry'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePoll}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Icon icon="mdi:close" className="text-xl" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-2">
              <label className="cursor-pointer text-gray-600 hover:text-purple-600 transition-colors p-1 rounded hover:bg-purple-50" title="Add image">
                <Icon icon="mdi:image" className="w-6 h-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowPollCreator(!showPollCreator)}
                disabled={!!pollData}
                className="text-gray-600 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add poll"
              >
                <Icon icon="mdi:poll" className="w-6 h-6" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isCreating || (!caption.trim() && !image && !pollData)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              {isCreating ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
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

export default CreatePost;