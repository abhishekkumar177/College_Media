import React from "react";

function RightSidebar() {
  const suggestedAccounts = [
    {
      username: "design_inspiration",
      avatar: "https://placehold.co/30x30/FF6B6B/FFFFFF?text=DI",
      followers: "2.1M",
    },
    {
      username: "tech_trends",
      avatar: "https://placehold.co/30x30/4ECDC4/FFFFFF?text=TT",
      followers: "1.8M",
    },
    {
      username: "art_daily",
      avatar: "https://placehold.co/30x30/45B7D1/FFFFFF?text=AD",
      followers: "3.4M",
    },
  ];

  const trendingHashtags = [
    "#photography",
    "#travel",
    "#fashion",
    "#food",
    "#art",
    "#fitness",
  ];

  const onlineFriends = [
    {
      username: "friend_one",
      avatar: "https://placehold.co/30x30/96CEB4/FFFFFF?text=F1",
    },
    {
      username: "friend_two",
      avatar: "https://placehold.co/30x30/DDA0DD/FFFFFF?text=F2",
    },
    {
      username: "friend_three",
      avatar: "https://placehold.co/30x30/FFB3BA/FFFFFF?text=F3",
    },
  ];

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Suggested Accounts */}
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
                  <p className="font-medium text-gray-800 text-sm cursor-pointer hover:text-purple-600 transition-colors duration-300">
                    {account.username}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {account.followers} followers
                  </p>
                </div>
              </div>
              <button className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors duration-300">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Hashtags */}
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

      {/* Online Friends */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="font-bold text-gray-800 mb-4">Online Friends</h3>
        <div className="flex space-x-3">
          {onlineFriends.map((friend, index) => (
            <div
              key={index}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-300"
            >
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.username}
                  className="w-12 h-12 rounded-full"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-xs text-gray-600 mt-1 truncate w-12 text-center">
                {friend.username}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
