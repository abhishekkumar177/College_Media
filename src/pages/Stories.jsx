import React from 'react';
import { Link } from 'react-router-dom';

const Stories = () => {
  const allStories = [
    {
      id: 1,
      user: {
        name: 'Alex Johnson',
        avatar: 'https://placehold.co/60x60/EF4444/FFFFFF?text=A',
      },
      stories: [
        { id: 1, type: 'image', content: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=600&fit=crop', timestamp: '2h ago' },
        { id: 2, type: 'image', content: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=600&fit=crop', timestamp: '3h ago' },
      ],
    },
    {
      id: 2,
      user: {
        name: 'Sarah Chen',
        avatar: 'https://placehold.co/60x60/F59E0B/FFFFFF?text=S',
      },
      stories: [
        { id: 1, type: 'image', content: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=600&fit=crop', timestamp: '5h ago' },
      ],
    },
    {
      id: 3,
      user: {
        name: 'Mike Davis',
        avatar: 'https://placehold.co/60x60/10B981/FFFFFF?text=M',
      },
      stories: [
        { id: 1, type: 'image', content: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=600&fit=crop', timestamp: '6h ago' },
        { id: 2, type: 'image', content: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=600&fit=crop', timestamp: '7h ago' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stories Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Stories</h1>
        <p className="text-gray-600">View stories from your friends and classmates</p>
      </div>

      {/* Create Story */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Create a Story</h3>
            <p className="text-sm text-gray-500">Share a photo or video with your friends</p>
          </div>
          <Link
            to="/create-story"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            Create
          </Link>
        </div>
      </div>

      {/* All Stories */}
      <div className="space-y-4">
        {allStories.map((userStory) => (
          <div key={userStory.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                  <div className="w-full h-full bg-white rounded-full p-0.5">
                    <img
                      src={userStory.user.avatar}
                      alt={userStory.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{userStory.user.name}</h3>
                <p className="text-sm text-gray-500">{userStory.stories.length} stories</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {userStory.stories.map((story) => (
                <div
                  key={story.id}
                  className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group"
                >
                  <img
                    src={story.content}
                    alt="Story"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium">{story.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;
