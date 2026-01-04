import React, { useState } from 'react';

const Reels = () => {
  const [currentReel, setCurrentReel] = useState(0);

  const reels = [
    {
      id: 1,
      user: {
        name: 'Sarah Chen',
        username: '@sarahchen',
        avatar: 'https://placehold.co/48x48/EC4899/FFFFFF?text=SC',
      },
      video: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=700&fit=crop',
      caption: 'Campus life hits different 🎓✨ #collegevibes',
      likes: 2340,
      comments: 156,
      shares: 45,
      music: 'Original Audio - Sarah Chen',
    },
    {
      id: 2,
      user: {
        name: 'Mike Johnson',
        username: '@mikej',
        avatar: 'https://placehold.co/48x48/3B82F6/FFFFFF?text=MJ',
      },
      video: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=700&fit=crop',
      caption: 'Study session turned into a photoshoot 📸📚',
      likes: 1890,
      comments: 98,
      shares: 23,
      music: 'Trending Sound - Popular',
    },
    {
      id: 3,
      user: {
        name: 'Emma Davis',
        username: '@emmad',
        avatar: 'https://placehold.co/48x48/10B981/FFFFFF?text=ED',
      },
      video: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=700&fit=crop',
      caption: 'Best campus sunset views 🌅',
      likes: 3120,
      comments: 234,
      shares: 67,
      music: 'Chill Vibes Mix',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Reels Header */}
      <div className="fixed top-0 left-64 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-6">
        <h1 className="text-2xl font-bold text-white">Reels</h1>
      </div>

      {/* Reels Container */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative w-full max-w-md h-screen bg-black">
          {/* Current Reel */}
          <div className="relative h-full">
            <img
              src={reels[currentReel].video}
              alt="Reel"
              className="w-full h-full object-cover"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* User Info */}
            <div className="absolute top-20 left-4 right-20">
              <div className="flex items-center space-x-3">
                <img
                  src={reels[currentReel].user.avatar}
                  alt={reels[currentReel].user.name}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div>
                  <p className="text-white font-bold">{reels[currentReel].user.name}</p>
                  <p className="text-white/80 text-sm">{reels[currentReel].user.username}</p>
                </div>
                <button className="ml-2 px-4 py-1.5 bg-white text-gray-900 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors duration-200">
                  Follow
                </button>
              </div>
            </div>

            {/* Caption and Music */}
            <div className="absolute bottom-20 left-4 right-20">
              <p className="text-white text-sm mb-3">{reels[currentReel].caption}</p>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <p className="text-white text-xs">{reels[currentReel].music}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-20 right-4 flex flex-col space-y-6">
              <button className="flex flex-col items-center space-y-1 group">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">{reels[currentReel].likes}</span>
              </button>

              <button className="flex flex-col items-center space-y-1 group">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">{reels[currentReel].comments}</span>
              </button>

              <button className="flex flex-col items-center space-y-1 group">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">{reels[currentReel].shares}</span>
              </button>

              <button className="flex flex-col items-center space-y-1 group">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Navigation Arrows */}
            {currentReel > 0 && (
              <button
                onClick={() => setCurrentReel(currentReel - 1)}
                className="absolute left-1/2 top-10 transform -translate-x-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}
            
            {currentReel < reels.length - 1 && (
              <button
                onClick={() => setCurrentReel(currentReel + 1)}
                className="absolute left-1/2 bottom-10 transform -translate-x-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reels;
