import React, { useState, useEffect, useRef } from "react";
import SkeletonPost from "../components/SkeletonPost";
import { sortByLatest, sortByLikes } from "../utils/feedSort";

const Home = () => {
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [shareMenuOpen, setShareMenuOpen] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [sortType, setSortType] = useState("latest");
  const shareMenuRef = useRef(null);

  const MAX_CAPTION_LENGTH = 150;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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
        "Just wrapped up an amazing group project with the best teammates! The semester might be ending, but the memories and skills we built together will last forever.",
      hashtags: ["#campuslife", "#teamwork"],
      likes: 127,
      comments: 45,
      shares: 12,
    },
    {
      id: 2,
      user: {
        username: "StudyBuddy",
        handle: "@studybuddies",
        title: "Study Group Leader",
        avatar: "https://placehold.co/48x48/10B981/FFFFFF?text=SB",
        time: "5 hours ago",
      },
      media:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
      caption:
        "Late night study session at the library with amazing friends!",
      hashtags: ["#studynight"],
      likes: 89,
      comments: 23,
      shares: 5,
    },
    {
      id: 3,
      user: {
        username: "CampusChef",
        handle: "@campuschef",
        title: "Food Enthusiast",
        avatar: "https://placehold.co/48x48/EF4444/FFFFFF?text=CC",
        time: "1 day ago",
      },
      media:
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop",
      caption:
        "Experimenting with new recipes in the dorm kitchen!",
      hashtags: ["#foodie"],
      likes: 156,
      comments: 34,
      shares: 8,
    },
  ];

  const sortedPosts =
    sortType === "likes" ? sortByLikes(posts) : sortByLatest(posts);

  // 🔥 TRENDING POSTS LOGIC
  const trendingPosts = [...posts]
    .sort((a, b) => {
      const scoreA = a.likes + a.comments + a.shares;
      const scoreB = b.likes + b.comments + b.shares;
      return scoreB - scoreA;
    })
    .slice(0, 3);

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="space-y-6" ref={shareMenuRef}>
      {/* Sort Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setSortType("latest")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            sortType === "latest"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Latest
        </button>
        <button
          onClick={() => setSortType("likes")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            sortType === "likes"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Most Liked
        </button>
      </div>

      {/* 🔥 TRENDING POSTS SECTION */}
      {!loading && trendingPosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border p-5">
          <h2 className="text-lg font-bold mb-4">🔥 Trending Now</h2>
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <div
                key={post.id}
                className="flex gap-4 items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <img
                  src={post.media}
                  alt="Trending"
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold line-clamp-2">{post.caption}</p>
                  <p className="text-sm text-gray-500">
                    ❤️ {post.likes} · 💬 {post.comments} · 🔁 {post.shares}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POSTS FEED */}
      {loading ? (
        <>
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
        </>
      ) : (
        sortedPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border p-5"
          >
            <div className="flex items-center gap-3">
              <img
                src={post.user.avatar}
                alt={post.user.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-bold">{post.user.username}</p>
                <p className="text-sm text-gray-500">{post.user.time}</p>
              </div>
            </div>

            <p className="mt-4">{post.caption}</p>

            <img
              src={post.media}
              alt="Post"
              className="mt-4 rounded-xl w-full"
            />

            <div className="flex gap-6 mt-4 text-sm">
              <button onClick={() => toggleLike(post.id)}>
                ❤️ {likedPosts[post.id] ? post.likes + 1 : post.likes}
              </button>
              <span>💬 {post.comments}</span>
              <span>🔁 {post.shares}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Home;
