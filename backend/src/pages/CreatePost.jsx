import React, { useState } from 'react';

const CreatePost = () => {
  const [postType, setPostType] = useState('text');
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = () => {
    // Handle post submission
    console.log('Post submitted:', { postType, caption, selectedFiles });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Post</h1>
        <p className="text-gray-600">Share your thoughts with your college community</p>
      </div>

      {/* Post Type Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Post Type</h2>
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => setPostType('text')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              postType === 'text'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <svg className={`w-6 h-6 mx-auto mb-2 ${postType === 'text' ? 'text-indigo-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <p className={`text-sm font-medium ${postType === 'text' ? 'text-indigo-600' : 'text-gray-600'}`}>Text</p>
          </button>

          <button
            onClick={() => setPostType('photo')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              postType === 'photo'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <svg className={`w-6 h-6 mx-auto mb-2 ${postType === 'photo' ? 'text-indigo-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={`text-sm font-medium ${postType === 'photo' ? 'text-indigo-600' : 'text-gray-600'}`}>Photo</p>
          </button>

          <button
            onClick={() => setPostType('video')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              postType === 'video'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <svg className={`w-6 h-6 mx-auto mb-2 ${postType === 'video' ? 'text-indigo-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className={`text-sm font-medium ${postType === 'video' ? 'text-indigo-600' : 'text-gray-600'}`}>Video</p>
          </button>

          <button
            onClick={() => setPostType('poll')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              postType === 'poll'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <svg className={`w-6 h-6 mx-auto mb-2 ${postType === 'poll' ? 'text-indigo-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className={`text-sm font-medium ${postType === 'poll' ? 'text-indigo-600' : 'text-gray-600'}`}>Poll</p>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-3 mb-4">
          <img
            src="https://placehold.co/48x48/4F46E5/FFFFFF?text=U"
            alt="User"
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <p className="font-bold text-gray-900">Your Name</p>
            <select className="mt-1 text-sm text-gray-600 border border-gray-300 rounded-lg px-2 py-1">
              <option>Public</option>
              <option>Friends</option>
              <option>Only Me</option>
            </select>
          </div>
        </div>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none text-gray-900"
          rows={6}
        />

        {/* File Upload */}
        {(postType === 'photo' || postType === 'video') && (
          <div className="mt-4">
            <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 transition-colors duration-200 cursor-pointer">
              <input
                type="file"
                multiple={postType === 'photo'}
                accept={postType === 'photo' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 font-medium">Click to upload {postType}</p>
                <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
              </div>
            </label>
            {selectedFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">{selectedFiles.length} file(s) selected</p>
              </div>
            )}
          </div>
        )}

        {/* Poll Options */}
        {postType === 'poll' && (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Option 1"
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input
              type="text"
              placeholder="Option 2"
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button className="text-indigo-600 font-medium text-sm hover:text-indigo-700">
              + Add Option
            </button>
          </div>
        )}

        {/* Add to Post */}
        <div className="mt-6 flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <p className="font-medium text-gray-900">Add to your post</p>
          <div className="flex space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
