import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { reel } from "../data/reel";
import SkeletonPost from "../components/SkeletonPost";
import { sortByLatest, sortByLikes } from "../utils/feedSort";

const Home = () => {
  const { t } = useTranslation();
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("latest");
  const [reelsData, setReelsData] = useState(reel);
  const [activeReelIndex, setActiveReelIndex] = useState(null);
  const reelsContainerRef = useRef(null);

  const MAX_CAPTION_LENGTH = 150;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Stories data
  const stories = [
    {
      id: 0,
      username: t('home.addStory'),
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
      hasStory: true,
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
      caption: "Late night study session at the library with amazing friends!",
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
      caption: "Experimenting with new recipes in the dorm kitchen!",
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
    <main id="main-content" role="main" className="space-y-6">
      {/* STORIES SECTION */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-4">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group"
            >
              <div
                className={`${story.hasStory
                    ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                    : "bg-bg-tertiary"
                  } ${story.isAddStory ? "p-0" : "p-0.5"
                  } rounded-full transition-transform group-hover:scale-105`}
              >
                <div className="bg-bg-secondary rounded-full p-0.5">
                  <img
                    src={story.avatar}
                    alt={story.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-center text-text-secondary font-medium truncate w-full">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reels Section */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <span className="text-2xl">🎬</span> {t('home.reels')}
          </h2>
          <button className="text-brand-primary text-sm font-medium hover:underline">
            {t('home.seeAll')}
          </button>
        </div>
        <div
          ref={reelsContainerRef}
          className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reelsData.slice(0, 8).map((reelItem, idx) => (
            <div
              key={idx}
              className="relative flex-shrink-0 w-32 h-56 rounded-xl overflow-hidden cursor-pointer group snap-start"
              onClick={() => setActiveReelIndex(idx)}
            >
              <video
                src={reelItem.video}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={reelItem.userprofile}
                      alt={reelItem.username}
                      className="w-6 h-6 rounded-full border border-white"
                    />
                    <span className="text-white text-xs font-medium truncate">
                      {reelItem.username}
                    </span>
                  </div>
                  <p className="text-white text-xs line-clamp-2 mb-2">
                    {reelItem.caption}
                  </p>
                  <div className="flex items-center gap-3 text-white text-xs">
                    <span className="flex items-center gap-1">
                      ❤️ {reelItem.likeCount > 1000 ? `${(reelItem.likeCount / 1000).toFixed(1)}k` : reelItem.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {reelItem.commentCount}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200">
                <div className="absolute top-2 right-2 w-8 h-8 bg-bg-secondary/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reel Modal */}
      {activeReelIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setActiveReelIndex(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-bg-secondary/10 hover:bg-bg-secondary/20 rounded-full flex items-center justify-center text-white z-10"
            onClick={() => setActiveReelIndex(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative w-full max-w-md h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-full rounded-xl overflow-hidden bg-black">
              <video
                src={reelsData[activeReelIndex].video}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted={reelsData[activeReelIndex].ismuted}
                playsInline
              />

              <div className="absolute top-3 right-3 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => {
                  const newReels = [...reelsData];
                  newReels[activeReelIndex].ismuted = !newReels[activeReelIndex].ismuted;
                  setReelsData(newReels);
                }}
              >
                {reelsData[activeReelIndex].ismuted ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={reelsData[activeReelIndex].userprofile}
                    alt={reelsData[activeReelIndex].username}
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">{reelsData[activeReelIndex].username}</p>
                  </div>
                  <button
                    onClick={() => {
                      const newReels = [...reelsData];
                      newReels[activeReelIndex].isFollowed = !newReels[activeReelIndex].isFollowed;
                      setReelsData(newReels);
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${reelsData[activeReelIndex].isFollowed
                        ? 'bg-white/20 text-white border border-white'
                        : 'bg-white text-black'
                      }`}
                  >
                    {reelsData[activeReelIndex].isFollowed ? t('home.following') : t('home.follow')}
                  </button>
                </div>
                <p className="text-white text-sm mb-4">{reelsData[activeReelIndex].caption}</p>
              </div>

              <div className="absolute right-4 bottom-24 flex flex-col gap-6">
                <button
                  onClick={() => {
                    const newReels = [...reelsData];
                    if (!newReels[activeReelIndex].isLiked) {
                      newReels[activeReelIndex].likeCount++;
                      newReels[activeReelIndex].isLiked = true;
                    } else {
                      newReels[activeReelIndex].likeCount--;
                      newReels[activeReelIndex].isLiked = false;
                    }
                    setReelsData(newReels);
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 bg-bg-secondary/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {reelsData[activeReelIndex].isLiked ? (
                      <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-white text-sm font-medium">
                    {reelsData[activeReelIndex].likeCount > 1000
                      ? `${(reelsData[activeReelIndex].likeCount / 1000).toFixed(1)}k`
                      : reelsData[activeReelIndex].likeCount}
                  </span>
                </button>

                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-bg-secondary/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium">{reelsData[activeReelIndex].commentCount}</span>
                </button>

                <button className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-bg-secondary/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium">{reelsData[activeReelIndex].shareCount}</span>
                </button>
              </div>

              {activeReelIndex > 0 && (
                <button
                  onClick={() => setActiveReelIndex(activeReelIndex - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-bg-secondary/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-bg-secondary/20"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {activeReelIndex < reelsData.length - 1 && (
                <button
                  onClick={() => setActiveReelIndex(activeReelIndex + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-bg-secondary/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-bg-secondary/20"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sort Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setSortType("latest")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${sortType === "latest"
              ? "bg-brand-primary text-white"
              : "bg-bg-tertiary text-text-secondary"
            }`}
        >
          {t('home.latest')}
        </button>
        <button
          onClick={() => setSortType("likes")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${sortType === "likes"
              ? "bg-brand-primary text-white"
              : "bg-bg-tertiary text-text-secondary"
            }`}
        >
          {t('home.mostLiked')}
        </button>
      </div>

      {/* 🔥 TRENDING POSTS SECTION */}
      {!loading && trendingPosts.length > 0 && (
        <div className="bg-bg-secondary rounded-2xl border border-border p-5">
          <h2 className="text-lg font-bold mb-4 text-text-primary">
            🔥 {t('home.trendingNow')}
          </h2>
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <div
                key={post.id}
                className="flex gap-4 items-center p-3 rounded-xl hover:bg-bg-primary"
              >
                <img
                  src={post.media}
                  alt="Trending"
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold line-clamp-2 text-text-primary">
                    {post.caption}
                  </p>
                  <p className="text-sm text-text-secondary">
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
            className="bg-bg-secondary rounded-2xl border border-border p-5"
          >
            <div className="flex items-center gap-3">
              <img
                src={post.user.avatar}
                alt={post.user.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-bold text-text-primary">
                  {post.user.username}
                </p>
                <p className="text-sm text-text-muted">
                  {post.user.time}
                </p>
              </div>
            </div>

            <p className="mt-4 text-text-primary">
              {post.caption}
            </p>

            <img
              src={post.media}
              alt="Post"
              className="mt-4 rounded-xl w-full"
            />

            <div className="flex gap-6 mt-4 text-sm text-text-secondary">
              <button
                onClick={() => toggleLike(post.id)}
                className="hover:text-red-500 transition-colors duration-200"
              >
                ❤️ {likedPosts[post.id] ? post.likes + 1 : post.likes}
              </button>
              <span className="hover:text-blue-500 transition-colors duration-200 cursor-pointer">
                💬 {post.comments}
              </span>
              <span className="hover:text-green-500 transition-colors duration-200 cursor-pointer">
                🔁 {post.shares}
              </span>
            </div>
          </div>
        ))
      )}
    </main>
  );
};

export default Home;

