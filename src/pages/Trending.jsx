import React from 'react';

const Trending = () => {
  const trendingTopics = [
    { id: 1, tag: '#campuslife', posts: '12.5K posts', trending: 'up' },
    { id: 2, tag: '#hackathon2024', posts: '8.2K posts', trending: 'up' },
    { id: 3, tag: '#studygroup', posts: '15.3K posts', trending: 'stable' },
    { id: 4, tag: '#collegesports', posts: '9.7K posts', trending: 'up' },
    { id: 5, tag: '#photography', posts: '25.1K posts', trending: 'up' },
    { id: 6, tag: '#examprep', posts: '6.4K posts', trending: 'down' },
  ];

  const trendingPosts = [
    {
      id: 1,
      user: {
        name: 'Sarah Chen',
        handle: '@sarahchen',
        avatar: 'https://placehold.co/48x48/EC4899/FFFFFF?text=SC',
      },
      content: 'Just finished my final project presentation! The energy in the room was incredible 🚀',
      likes: 234,
      comments: 45,
      tag: '#campuslife',
    },
    {
      id: 2,
      user: {
        name: 'Mike Johnson',
        handle: '@mikej',
        avatar: 'https://placehold.co/48x48/3B82F6/FFFFFF?text=MJ',
      },
      content: 'Our team won the hackathon! 48 hours of coding finally paid off 💻🏆',
      likes: 567,
      comments: 89,
      tag: '#hackathon2024',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Trending Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trending Now</h1>
        <p className="text-gray-600">Discover what's popular in your college community</p>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Trending Topics</h2>
        <div className="space-y-3">
          {trendingTopics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
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
                <div>
                  <p className="font-bold text-indigo-600">{topic.tag}</p>
                  <p className="text-sm text-gray-500">{topic.posts}</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Posts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Posts</h2>
        <div className="space-y-4">
          {trendingPosts.map((post) => (
            <div key={post.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200">
              <div className="flex items-center space-x-3 mb-3">
                <img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-bold text-gray-900">{post.user.name}</p>
                  <p className="text-sm text-gray-500">{post.user.handle}</p>
                </div>
              </div>
              <p className="text-gray-800 mb-3">{post.content}</p>
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-3">
                {post.tag}
              </span>
              <div className="flex items-center space-x-6 text-gray-500 text-sm">
                <span className="flex items-center space-x-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likes}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post.comments}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trending;
