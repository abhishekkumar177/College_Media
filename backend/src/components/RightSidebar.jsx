import React from "react";

function RightSidebar() {
  const friendSuggestions = [
    {
      name: "Julia Smith",
      avatar: "https://placehold.co/40x40/6366F1/FFFFFF?text=JS",
      followers: "2.1K",
    },
    {
      name: "Vermillion D. Gray",
      avatar: "https://placehold.co/40x40/3B82F6/FFFFFF?text=VG",
      followers: "1.8K",
    },
    {
      name: "Mai Senpai",
      avatar: "https://placehold.co/40x40/8B5CF6/FFFFFF?text=MS",
      followers: "3.4K",
    },
    {
      name: "Azunyan U. Wu",
      avatar: "https://placehold.co/40x40/EC4899/FFFFFF?text=AW",
      followers: "956",
    },
  ];

  const trendingHashtags = [
    "#photography",
    "#campuslife",
    "#studygroup",
    "#collegesports",
    "#hackathon2024",
  ];

  const onlineFriends = [
    {
      name: "friend_one",
      avatar: "https://placehold.co/48x48/10B981/FFFFFF?text=F1",
    },
    {
      name: "friend_two",
      avatar: "https://placehold.co/48x48/A78BFA/FFFFFF?text=F2",
    },
    {
      name: "friend_three",
      avatar: "https://placehold.co/48x48/F472B6/FFFFFF?text=F3",
    },
  ];

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Friend Suggestions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Friend Suggestions</h3>
          <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center">
            See All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          {friendSuggestions.map((friend, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm cursor-pointer hover:text-indigo-600 transition-colors duration-300">
                    {friend.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {friend.followers} followers
                  </p>
                </div>
              </div>
              <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-300">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="font-bold text-gray-800 text-lg">Trending Now</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingHashtags.map((hashtag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-300 cursor-pointer"
            >
              {hashtag}
            </span>
          ))}
        </div>
      </div>

      {/* Profile Activity */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-sm border border-indigo-700 p-5 text-white">
        <h3 className="font-bold text-lg mb-3">Profile Activity</h3>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <img src="https://placehold.co/32x32/6366F1/FFFFFF?text=U1" alt="User" className="w-8 h-8 rounded-full" />
              <img src="https://placehold.co/32x32/3B82F6/FFFFFF?text=U2" alt="User" className="w-8 h-8 rounded-full -ml-3" />
              <img src="https://placehold.co/32x32/8B5CF6/FFFFFF?text=U3" alt="User" className="w-8 h-8 rounded-full -ml-3" />
              <img src="https://placehold.co/32x32/EC4899/FFFFFF?text=U4" alt="User" className="w-8 h-8 rounded-full -ml-3" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">+1,158</div>
          <div className="text-sm opacity-90 mb-2">New Followers</div>
          <div className="text-xs opacity-75 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            23% vs last month
          </div>
        </div>
        <p className="text-sm opacity-90">You gained a substantial amount of followers this month!</p>
      </div>

      {/* Online Friends */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Online Friends</h3>
        <div className="flex items-center space-x-3">
          {onlineFriends.map((friend, index) => (
            <div
              key={index}
              className="relative cursor-pointer hover:scale-105 transition-transform duration-300"
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          ))}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm cursor-pointer hover:bg-gray-200 transition-colors duration-300">
            +12
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
