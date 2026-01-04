
import React, { useState, useEffect } from "react";
import PostFeed from "../components/PostFeed";
import SkeletonPost from "../components/SkeletonPost";
import SEO from "../components/Seo";

const Home = () => {
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Mock data for stories
  const stories = [
    {
      id: 0,
      username: "Add Story",
      avatar: "https://placehold.co/80x80/4F46E5/FFFFFF?text=+",
      hasStory: false,
      isAddStory: true,
    },
    {
      id: 1,
      username: "Alex",
      avatar: "https://placehold.co/80x80/EF4444/FFFFFF?text=A",
      hasStory: true,
    },
    {
      id: 2,
      username: "Sarah",
      avatar: "https://placehold.co/80x80/F59E0B/FFFFFF?text=S",
      hasStory: true,
    },
    {
      id: 3,
      username: "Mike",
      avatar: "https://placehold.co/80x80/10B981/FFFFFF?text=M",
      hasStory: false,
    },
    {
      id: 4,
      username: "Emily",
      avatar: "https://placehold.co/80x80/6366F1/FFFFFF?text=E",
      hasStory: true,
    },
    {
      id: 5,
      username: "James",
      avatar: "https://placehold.co/80x80/8B5CF6/FFFFFF?text=J",
      hasStory: true,
    },
    {
      id: 6,
      username: "Lisa",
      avatar: "https://placehold.co/80x80/EC4899/FFFFFF?text=L",
      hasStory: true,
    },
  ];

  const posts = [
    {
      id: 1,
      user: {
        username: "X_AE_A-13",
        handle: "@xaea13",
        title: "Product Designer, CollegeUI",
        avatar: "https://placehold.co/48x48/4F46E5/FFFFFF?text=XA",
        time: "2 hours ago",
      },
      media:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
      caption:
        "Just wrapped up an amazing group project with the best teammates! The semester might be ending, but the memories and skills we built together will last forever. Can't wait to see what next year brings! 🎓✨",
      hashtags: ["#campuslife", "#teamwork", "#collegedays", "#memories"],
      likes: 127,
      comments: 45,
      shares: 12,
      bookmarks: 8,
    },
  ];

  const toggleLike = (postId) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  useEffect(() => {
    // Add your data fetching logic here
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stories Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Stories</h2>
          <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center">
            See All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer"
            >
              <div
                className={`relative w-20 h-20 rounded-full p-0.5 transition-all duration-300 ${
                  story.isAddStory
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600"
                    : story.hasStory
                    ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                    : "bg-gray-300"
                }`}
              >
                <div className="w-full h-full bg-white rounded-full p-0.5">
                  <img
                    src={story.avatar}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {story.hasStory && (
                  <div className="absolute top-0 right-0 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-md"></div>
                )}
                {story.isAddStory && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600 truncate w-20 text-center font-medium">
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
        </>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center space-x-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.username}
                  className="w-12 h-12 rounded-full cursor-pointer hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors duration-300">
                      {post.user.username}
                    </span>
                    <span className="text-gray-500 text-sm">{post.user.handle}</span>
                  </div>
                  <p className="text-xs text-gray-500">{post.user.title} • {post.user.time}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300">
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            </div>

            {/* Post Content */}
            <div className="px-5 pb-4">
              <p className="text-gray-800 mb-3 leading-relaxed">
                {post.caption}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {post.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-indigo-600 text-sm font-medium hover:text-indigo-700 cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
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
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center space-x-2 group"
                  >
                    <svg
                      className={`w-6 h-6 transition-all duration-300 ${
                        likedPosts[post.id]
                          ? "fill-red-500 text-red-500 scale-110"
                          : "text-gray-600 group-hover:text-red-500"
                      }`}
                      fill={likedPosts[post.id] ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="font-semibold text-gray-700 text-sm">
                      {likedPosts[post.id] ? post.likes + 1 : post.likes}
                    </span>
                  </button>

                  <button className="flex items-center space-x-2 group">
                    <svg
                      className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="font-semibold text-gray-700 text-sm">
                      {post.comments}
                    </span>
                  </button>

                  <button className="flex items-center space-x-2 group">
                    <svg
                      className="w-6 h-6 text-gray-600 group-hover:text-green-500 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    <span className="font-semibold text-gray-700 text-sm">
                      {post.shares}
                    </span>
                  </button>
                </div>

                <button className="group">
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </div>
  );
};

export default Home;
