import React, { useState, useEffect } from 'react';

const Trending = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const categories = [
    { id: 'all', name: 'All', icon: '🔥', color: 'indigo' },
    { id: 'academics', name: 'Academics', icon: '📚', color: 'blue' },
    { id: 'events', name: 'Events', icon: '🎉', color: 'purple' },
    { id: 'sports', name: 'Sports', icon: '⚽', color: 'green' },
    { id: 'tech', name: 'Tech', icon: '💻', color: 'cyan' },
    { id: 'social', name: 'Social', icon: '👥', color: 'pink' },
  ];

  const timeRanges = [
    { id: 'hour', name: 'Last Hour', icon: '⚡' },
    { id: 'today', name: 'Today', icon: '🌅' },
    { id: 'week', name: 'This Week', icon: '📅' },
  ];

  const trendingTopics = [
    { 
      id: 1, 
      tag: '#campuslife', 
      posts: '12.5K', 
      trending: 'up', 
      change: '+45%',
      category: 'social',
      engagementScore: 8542,
      peakTime: '2:00 PM',
      relatedTags: ['#college', '#students', '#fun'],
      reason: 'Popular due to semester start'
    },
    { 
      id: 2, 
      tag: '#hackathon2024', 
      posts: '8.2K', 
      trending: 'up', 
      change: '+89%',
      category: 'tech',
      engagementScore: 9823,
      peakTime: '6:00 PM',
      relatedTags: ['#coding', '#innovation', '#tech'],
      reason: 'Major event happening this weekend',
      badge: 'rising'
    },
    { 
      id: 3, 
      tag: '#studygroup', 
      posts: '15.3K', 
      trending: 'stable', 
      change: '+5%',
      category: 'academics',
      engagementScore: 7234,
      peakTime: '9:00 AM',
      relatedTags: ['#exams', '#study', '#notes'],
      reason: 'Midterm exams approaching'
    },
    { 
      id: 4, 
      tag: '#collegesports', 
      posts: '9.7K', 
      trending: 'up', 
      change: '+34%',
      category: 'sports',
      engagementScore: 6892,
      peakTime: '5:00 PM',
      relatedTags: ['#basketball', '#football', '#athletics'],
      reason: 'Inter-college tournament ongoing'
    },
    { 
      id: 5, 
      tag: '#photography', 
      posts: '25.1K', 
      trending: 'up', 
      change: '+67%',
      category: 'all',
      engagementScore: 12453,
      peakTime: '12:00 PM',
      relatedTags: ['#art', '#creative', '#campus'],
      reason: 'Photography contest announced',
      badge: 'hot'
    },
    { 
      id: 6, 
      tag: '#examprep', 
      posts: '6.4K', 
      trending: 'down', 
      change: '-12%',
      category: 'academics',
      engagementScore: 4521,
      peakTime: '10:00 AM',
      relatedTags: ['#study', '#finals', '#tips'],
      reason: 'Exam period ending'
    },
  ];

  const trendingPosts = [
    {
      id: 1,
      user: {
        name: 'Sarah Chen',
        handle: '@sarahchen',
        avatar: 'https://placehold.co/48x48/EC4899/FFFFFF?text=SC',
        verified: true
      },
      content: 'Just finished my final project presentation! The energy in the room was incredible 🚀',
      likes: 234,
      comments: 45,
      shares: 12,
      tag: '#campuslife',
      timestamp: '2h ago',
      category: 'social'
    },
    {
      id: 2,
      user: {
        name: 'Mike Johnson',
        handle: '@mikej',
        avatar: 'https://placehold.co/48x48/3B82F6/FFFFFF?text=MJ',
        verified: false
      },
      content: 'Our team won the hackathon! 48 hours of coding finally paid off 💻🏆',
      likes: 567,
      comments: 89,
      shares: 45,
      tag: '#hackathon2024',
      timestamp: '5h ago',
      category: 'tech'
    },
  ];

  const filteredTopics = trendingTopics.filter(topic => 
    selectedCategory === 'all' || topic.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Trending Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trending Now</h1>
            <p className="text-gray-600">Discover what's popular in your college community</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center space-x-1">
              <span className="animate-pulse">●</span>
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="flex space-x-2 mb-4">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeRange === range.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{range.icon}</span>
              {range.name}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-100">Total Trending</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-bold">{filteredTopics.length}</div>
          <div className="text-indigo-100 text-sm mt-1">Active topics</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Rising Fast</span>
            <span className="text-2xl">🚀</span>
          </div>
          <div className="text-3xl font-bold">
            {filteredTopics.filter(t => t.badge === 'rising').length}
          </div>
          <div className="text-green-100 text-sm mt-1">Quick growth</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100">Hot Topics</span>
            <span className="text-2xl">🔥</span>
          </div>
          <div className="text-3xl font-bold">
            {filteredTopics.filter(t => t.badge === 'hot').length}
          </div>
          <div className="text-orange-100 text-sm mt-1">High engagement</div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Top Trending Topics</h2>
        <div className="space-y-3">
          {filteredTopics.map((topic, index) => (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)}
              className="relative p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-indigo-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Rank Badge */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 font-bold text-gray-700 text-sm">
                    {index + 1}
                  </div>

                  {/* Trend Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                    {topic.trending === 'up' ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : topic.trending === 'down' ? (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                    )}
                  </div>

                  {/* Topic Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-indigo-600">{topic.tag}</p>
                      {topic.badge === 'rising' && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
                          🚀 RISING
                        </span>
                      )}
                      {topic.badge === 'hot' && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full">
                          🔥 HOT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm text-gray-500">{topic.posts} posts</p>
                      <span className={`text-sm font-medium ${
                        topic.trending === 'up' ? 'text-green-600' : 
                        topic.trending === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {topic.change}
                      </span>
                      <span className="text-xs text-gray-400">• Peak: {topic.peakTime}</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Score */}
                <div className="flex flex-col items-end space-y-1">
                  <div className="text-sm font-medium text-gray-700">
                    Score: {topic.engagementScore.toLocaleString()}
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      selectedTopic?.id === topic.id ? 'rotate-90' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedTopic?.id === topic.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {/* Reason */}
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Why it's trending:</p>
                      <p className="text-sm text-gray-600">{topic.reason}</p>
                    </div>
                  </div>

                  {/* Related Tags */}
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">🏷️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">Related topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {topic.relatedTags.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium hover:bg-indigo-100 cursor-pointer transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
                    Join the Conversation
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trending in Your Circle */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-sm border border-purple-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">👥</span>
          <h2 className="text-lg font-bold text-gray-900">Trending in Your Circle</h2>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-gray-600 text-sm mb-3">
            Your friends are talking about <span className="font-bold text-indigo-600">#hackathon2024</span> and <span className="font-bold text-indigo-600">#photography</span>
          </p>
          <button className="text-indigo-600 font-medium text-sm hover:text-indigo-700">
            See what they're saying →
          </button>
        </div>
      </div>

      {/* Trending Posts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Popular Posts</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="animate-pulse text-green-500">●</span>
            <span>Updated 2m ago</span>
          </div>
        </div>
        <div className="space-y-4">
          {trendingPosts.map((post) => (
            <div key={post.id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 rounded-full ring-2 ring-indigo-100" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-gray-900">{post.user.name}</p>
                      {post.user.verified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{post.user.handle} • {post.timestamp}</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-800 mb-3">{post.content}</p>
              <div className="flex items-center space-x-2 mb-3">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {post.tag}
                </span>
                <span className="text-xs text-gray-500">
                  Engagement Score: {(post.likes + post.comments * 3 + post.shares * 5).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-6 text-gray-500 text-sm">
                  <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>{post.shares}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trending;
