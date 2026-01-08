import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CreateStory = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [storyText, setStoryText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#6366F1');
  const [storyType, setStoryType] = useState('photo'); // 'photo' or 'text'

  const backgroundColors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Green
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#F97316', // Orange
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle story creation logic here
    console.log('Story created:', { selectedFile, storyText, backgroundColor, storyType });
    navigate('/stories');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create a Story</h1>
            <p className="text-gray-600">Share a moment with your friends and classmates</p>
          </div>
          <Link
            to="/stories"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Story Type Selection */}
        <div className="space-y-6">
          {/* Type Selector */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Story Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setStoryType('photo')}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  storyType === 'photo'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className={`w-8 h-8 mx-auto mb-2 ${storyType === 'photo' ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className={`font-medium ${storyType === 'photo' ? 'text-indigo-600' : 'text-gray-600'}`}>Photo/Video</p>
              </button>
              <button
                type="button"
                onClick={() => setStoryType('text')}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  storyType === 'text'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className={`w-8 h-8 mx-auto mb-2 ${storyType === 'text' ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <p className={`font-medium ${storyType === 'text' ? 'text-indigo-600' : 'text-gray-600'}`}>Text Only</p>
              </button>
            </div>
          </div>

          {/* Upload Section */}
          {storyType === 'photo' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Media</h2>
              <div className="space-y-4">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="font-medium text-gray-900 mb-1">Click to upload</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF or MP4 up to 10MB</p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Text Story</h2>
              <textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                rows={6}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-2">{storyText.length}/200 characters</p>

              {/* Background Color Selector */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Background Color</h3>
                <div className="grid grid-cols-8 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBackgroundColor(color)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${
                        backgroundColor === color ? 'ring-4 ring-offset-2 ring-gray-300' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Privacy</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" name="privacy" defaultChecked className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Everyone</p>
                  <p className="text-sm text-gray-500">All your friends can see this story</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" name="privacy" className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Close Friends</p>
                  <p className="text-sm text-gray-500">Only your close friends can see this</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Preview</h2>
            <div className="max-w-xs mx-auto">
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-lg">
                {storyType === 'photo' ? (
                  previewUrl ? (
                    <img src={previewUrl} alt="Story Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">Upload a photo or video</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center p-8"
                    style={{ backgroundColor }}
                  >
                    <p className="text-white text-xl font-bold text-center break-words">
                      {storyText || 'Your text will appear here'}
                    </p>
                  </div>
                )}
                
                {/* Story Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://placehold.co/40x40/4F46E5/FFFFFF?text=U"
                      alt="Your profile"
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">Your Story</p>
                      <p className="text-white/80 text-xs">Just now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={storyType === 'photo' ? !selectedFile : !storyText}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Share Story
            </button>
            <Link
              to="/stories"
              className="block w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200 text-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;
