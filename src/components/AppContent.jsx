import React from 'react';
import NotificationList from './NotificationList';
import NotificationPreferences from './NotificationPreferences';

/**
 * AppContent Component
 * Renders the main content based on the active tab
 */
const AppContent = ({ activeTab, stories, currentStoryIndex, setCurrentStoryIndex, posts, likedPosts, toggleLike, suggestedAccounts, trendingHashtags, onlineFriends }) => {
  /**
   * Render content based on active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <div className="lg:col-span-2 space-y-6">
            {/* ========== STORIES CAROUSEL ========== */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                {stories.map((story, index) => (
                  <div
                    key={story.id}
                    className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => setCurrentStoryIndex(index)}
                  >
                    <div className={`relative w-16 h-16 rounded-full border-2 transition-all duration-500 ${
                      index === currentStoryIndex
                        ? "border-gradient-to-r"
                        : "border-gray-300"
                    }`}>
                      <img
                        src={story.avatar}
                        alt={story.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                      {index === currentStoryIndex && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 truncate w-16 text-center">{story.username}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ========== POSTS FEED ========== */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* ========== POST HEADER ========== */}
                <div className="flex items-center p-4 border-b border-gray-100">
                  <img
                    src={post.user.avatar}
                    alt={post.user.username}
                    className="w-10 h-10 rounded-full mr-3 cursor-pointer hover:scale-110 transition-transform duration-300"
                  />
                  <span className="font-semibold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors duration-300">{post.user.username}</span>
                  <div className="ml-auto cursor-pointer hover:text-gray-500 transition-colors duration-300">
                    <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>
                </div>

                {/* ========== POST MEDIA ========== */}
                <div className="w-full cursor-pointer">
                  <img
                    src={post.media}
                    alt="Post content"
                    className="w-full object-cover hover:opacity-95 transition-opacity duration-300"
                  />
                </div>

                {/* ========== POST INTERACTIONS ========== */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex space-x-4">
                      {/* LIKE BUTTON */}
                      <button
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center space-x-1 group"
                      >
                        <svg
                          className={`w-6 h-6 transition-all duration-300 ${
                            likedPosts[post.id]
                              ? "fill-pink-500 text-pink-500 scale-110 animate-bounce"
                              : "text-gray-600 group-hover:text-pink-500"
                          }`}
                          fill={likedPosts[post.id] ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-medium text-gray-700">{likedPosts[post.id] ? post.likes + 1 : post.likes}</span>
                      </button>

                      {/* COMMENT BUTTON */}
                      <button className="flex items-center space-x-1 group cursor-pointer">
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-medium text-gray-700">{post.comments}</span>
                      </button>
                    </div>

                    {/* SHARE BUTTON */}
                    <button className="group cursor-pointer">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>

                  {/* POST CAPTION */}
                  <div className="mb-3">
                    <p className="text-gray-800">
                      <span className="font-semibold mr-2 cursor-pointer hover:text-purple-600 transition-colors duration-300">{post.user.username}</span>
                      {post.caption}
                    </p>
                  </div>

                  {/* VIEW COMMENTS */}
                  <button className="text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors duration-300 cursor-pointer">
                    View all {post.comments} comments
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Notifications':
        return (
          <div className="lg:col-span-2">
            <NotificationList />
          </div>
        );

      case 'Settings':
        return (
          <div className="lg:col-span-2">
            <NotificationPreferences />
          </div>
        );

      case 'Explore':
        return (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Explore</h2>
              <p className="text-gray-600">Discover new posts and users</p>
            </div>
          </div>
        );

      case 'Reels':
        return (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reels</h2>
              <p className="text-gray-600">Watch short videos</p>
            </div>
          </div>
        );

      case 'Messages':
        return (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
              <p className="text-gray-600">Chat with your friends</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to College Media</h2>
              <p className="text-gray-600">Select a tab to get started</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* ========== LEFT SIDEBAR ========== */}
      <div className="lg:col-span-1">
        {/* Sidebar content will be handled in App.jsx */}
      </div>

      {/* ========== CENTRAL CONTENT ========== */}
      {renderTabContent()}

      {/* ========== RIGHT SIDEBAR ========== */}
      <div className="lg:col-span-1 space-y-6">
        {/* ========== SUGGESTED ACCOUNTS ========== */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-4">Suggested for you</h3>
          <div className="space-y-3">
            {suggestedAccounts.map((account, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={account.avatar}
                    alt={account.username}
                    className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform duration-300"
                  />
                  <div>
                    <p className="font-medium text-gray-800 text-sm cursor-pointer hover:text-purple-600 transition-colors duration-300">{account.username}</p>
                    <p className="text-gray-500 text-xs">{account.followers} followers</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors duration-300">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ========== TRENDING HASHTAGS ========== */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-4">Trending</h3>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map((hashtag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-sm font-medium hover:from-pink-200 hover:to-purple-200 transition-all duration-300 cursor-pointer hover:shadow-sm"
              >
                {hashtag}
              </span>
            ))}
          </div>
        </div>

        {/* ========== ONLINE FRIENDS ========== */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-4">Online Friends</h3>
          <div className="flex space-x-3">
            {onlineFriends.map((friend, index) => (
              <div key={index} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-xs text-gray-600 mt-1 truncate w-12 text-center">{friend.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppContent;
