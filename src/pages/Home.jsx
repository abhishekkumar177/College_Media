import React, { useState, useEffect } from "react";
import SkeletonPost from "../components/SkeletonPost";

const Home = () => {
  const [likedPosts, setLikedPosts] = useState({});
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔹 ADD THIS RIGHT HERE 👇
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Mock data
  const stories = [
    {
      id: 1,
      username: "user1",
      avatar: "https://placehold.co/100x100/FF6B6B/FFFFFF?text=U1",
    },
    {
      id: 2,
      username: "user2",
      avatar: "https://placehold.co/100x100/4ECDC4/FFFFFF?text=U2",
    },
    {
      id: 3,
      username: "user3",
      avatar: "https://placehold.co/100x100/45B7D1/FFFFFF?text=U3",
    },
    {
      id: 4,
      username: "user4",
      avatar: "https://placehold.co/100x100/96CEB4/FFFFFF?text=U4",
    },
    {
      id: 5,
      username: "user5",
      avatar: "https://placehold.co/100x100/FFEAA7/FFFFFF?text=U5",
    },
    {
      id: 6,
      username: "user6",
      avatar: "https://placehold.co/100x100/DDA0DD/FFFFFF?text=U6",
    },
    {
      id: 7,
      username: "user7",
      avatar: "https://placehold.co/100x100/FFB3BA/FFFFFF?text=U7",
    },
  ];

  const posts = [
    {
      id: 1,
      user: {
        username: "traveler_adventures",
        avatar: "https://placehold.co/40x40/FF6B6B/FFFFFF?text=TA",
      },
      media:
        "https://placehold.co/500x600/4ECDC4/FFFFFF?text=Beautiful+Landscape",
      caption:
        "Exploring the hidden gems of nature 🌿 #wanderlust #naturephotography",
      likes: 245,
      comments: 18,
    },
    {
      id: 2,
      user: {
        username: "foodie_delights",
        avatar: "https://placehold.co/40x40/45B7D1/FFFFFF?text=FD",
      },
      media: "https://placehold.co/500x600/FFEAA7/FFFFFF?text=Delicious+Food",
      caption:
        "Just tried the best pasta in town! 🍝 Tag someone who needs to try this! #foodie #pasta",
      likes: 892,
      comments: 43,
    },
    {
      id: 3,
      user: {
        username: "fitness_motivation",
        avatar: "https://placehold.co/40x40/96CEB4/FFFFFF?text=FM",
      },
      media: "https://placehold.co/500x600/DDA0DD/FFFFFF?text=Workout+Session",
      caption:
        "Consistency is key 💪 Day 45 of my fitness journey! #fitness #gymmotivation",
      likes: 1567,
      comments: 89,
    },
  ];

  // Auto-scroll stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stories.length]);

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div>
      {/* Central Feed */}
      {/* Stories Carousel */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => setCurrentStoryIndex(index)}
            >
              <div
                className={`relative w-16 h-16 rounded-full border-2 transition-all duration-500 ${
                  index === currentStoryIndex
                    ? "border-gradient-to-r from-pink-500 via-purple-500 to-orange-400 animate-pulse"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={story.avatar}
                  alt={story.username}
                  className="w-full h-full rounded-full object-cover"
                />
                {index === currentStoryIndex && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <span className="text-xs text-gray-600 truncate w-16 text-center">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <>
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
        </>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            {/* Post Header */}
            <div className="flex items-center p-4 border-b border-gray-100">
              <img
                src={post.user.avatar}
                alt={post.user.username}
                className="w-10 h-10 rounded-full mr-3 cursor-pointer hover:scale-110 transition-transform duration-300"
              />
              <span className="font-semibold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors duration-300">
                {post.user.username}
              </span>
              <div className="ml-auto cursor-pointer hover:text-gray-500 transition-colors duration-300">
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </div>
            </div>

            {/* Post Media */}
            <div className="w-full cursor-pointer">
              <img
                src={post.media}
                alt="Post content"
                className="w-full object-cover hover:opacity-95 transition-opacity duration-300"
              />
            </div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex space-x-4">
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="font-medium text-gray-700">
                      {likedPosts[post.id] ? post.likes + 1 : post.likes}
                    </span>
                  </button>

                  <button className="flex items-center space-x-1 group cursor-pointer">
                    <svg
                      className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="font-medium text-gray-700">
                      {post.comments}
                    </span>
                  </button>
                </div>

                <button className="group cursor-pointer">
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-purple-500 transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </button>
              </div>

              {/* Caption */}
              <div className="mb-3">
                <p className="text-gray-800">
                  <span className="font-semibold mr-2 cursor-pointer hover:text-purple-600 transition-colors duration-300">
                    {post.user.username}
                  </span>
                  {post.caption}
                </p>
              </div>

              {/* View all comments */}
              <button className="text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors duration-300 cursor-pointer">
                View all {post.comments} comments
              </button>
            </div>
          </div>
        ))
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .border-gradient-to-r {
          background: linear-gradient(to right, #ec4899, #8b5cf6, #f97316);
          border: 2px solid transparent;
          background-clip: padding-box, border-box;
          background-origin: padding-box, border-box;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        .animate-bounce {
          animation: bounce 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Home;
