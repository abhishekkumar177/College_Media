import { useState, useEffect } from "react";
import CreatePost from "../components/CreatePost.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Feed = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filters = [
    { id: "all", label: "All Posts", icon: "📰" },
    { id: "following", label: "Following", icon: "👥" },
    { id: "popular", label: "Popular", icon: "🔥" },
    { id: "recent", label: "Recent", icon: "⚡" },
  ];

  const defaultPosts = [
    {
      id: 1,
      user: {
        name: "Alex Kumar",
        username: "@alexk",
        avatar: "https://i.pravatar.cc/150?img=11",
        verified: true,
      },
      content: "Just launched my new web app! 🚀 It uses React, Node.js, and MongoDB. Would love to hear your feedback!",
      image: "https://picsum.photos/600/400?random=1",
      timestamp: "2h ago",
      likes: 234,
      comments: 45,
      shares: 12,
      tags: ["#webdev", "#react", "#mongodb"],
    },
    {
      id: 2,
      user: {
        name: "Sarah Miller",
        username: "@sarahm",
        avatar: "https://i.pravatar.cc/150?img=5",
        verified: false,
      },
      content: "Amazing lecture today on Machine Learning! Professor explained neural networks so well. Can't wait to implement what I learned 🤖",
      timestamp: "4h ago",
      likes: 189,
      comments: 23,
      shares: 8,
      tags: ["#machinelearning", "#AI", "#education"],
    },
    {
      id: 3,
      user: {
        name: "David Chen",
        username: "@davidc",
        avatar: "https://i.pravatar.cc/150?img=8",
        verified: true,
      },
      content: "Our college team won the hackathon! 36 hours of coding, debugging, and pizza. Worth it! 🏆",
      image: "https://picsum.photos/600/400?random=2",
      timestamp: "6h ago",
      likes: 567,
      comments: 89,
      shares: 34,
      tags: ["#hackathon", "#teamwork", "#victory"],
    },
    {
      id: 4,
      user: {
        name: "Emma Rodriguez",
        username: "@emmar",
        avatar: "https://i.pravatar.cc/150?img=9",
        verified: false,
      },
      content: "Study tip: Use the Pomodoro Technique! 25 min focused work + 5 min break. Has improved my productivity significantly 📚✨",
      timestamp: "8h ago",
      likes: 423,
      comments: 67,
      shares: 91,
      tags: ["#studytips", "#productivity"],
    },
    {
      id: 5,
      user: {
        name: "James Wilson",
        username: "@jamesw",
        avatar: "https://i.pravatar.cc/150?img=12",
        verified: true,
      },
      content: "Campus photography club is hosting a workshop this weekend! Learn about composition, lighting, and editing. Open to all students 📸",
      image: "https://picsum.photos/600/400?random=3",
      timestamp: "10h ago",
      likes: 298,
      comments: 34,
      shares: 45,
      tags: ["#photography", "#workshop", "#campuslife"],
    },
  ];

  // Load posts from localStorage or use default posts
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('feedPosts');
    if (savedPosts) {
      try {
        return JSON.parse(savedPosts);
      } catch (error) {
        console.error('Error parsing saved posts:', error);
        return defaultPosts;
      }
    }
    return defaultPosts;
  });

  // Save posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('feedPosts', JSON.stringify(posts));
  }, [posts]);

  const handlePostCreated = (newPost) => {
    console.log('New post created:', newPost);
    console.log('Current user:', user);
    
    // Add the new post to the top of the feed
    const formattedPost = {
      id: newPost.id,
      user: {
        name: user?.name || user?.username || "You",
        username: user?.username || "@you",
        avatar: user?.profilePicture || "https://i.pravatar.cc/150?img=1",
        verified: user?.verified || false,
      },
      content: newPost.caption || "",
      image: newPost.imageUrl || null,
      timestamp: newPost.timestamp || "Just now",
      likes: newPost.likes || 0,
      comments: newPost.comments || 0,
      shares: 0,
      tags: [],
    };
    
    console.log('Formatted post:', formattedPost);
    
    // Use functional update to get the latest posts state
    setPosts((prevPosts) => {
      console.log('Previous posts count:', prevPosts.length);
      const newPosts = [formattedPost, ...prevPosts];
      console.log('New posts count:', newPosts.length);
      return newPosts;
    });
    
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Feed Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Your Feed
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Stay updated with posts from your college community
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              <span className="mr-1">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Post Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?img=1"
            alt="Your avatar"
            className="w-12 h-12 rounded-full"
          />
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-left hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            What's on your mind?
          </button>
        </div>
        <div className="flex items-center justify-around mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Photo</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Video</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <span className="text-sm font-medium">Poll</span>
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <CreatePost 
                onPostCreated={handlePostCreated}
              />
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Post Header */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="w-12 h-12 rounded-full ring-2 ring-purple-100 dark:ring-purple-900"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {post.user.name}
                    </h3>
                    {post.user.verified && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {post.user.username} • {post.timestamp}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            {/* Post Content */}
            <p className="text-slate-800 dark:text-slate-200 mb-3">
              {post.content}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Post Image */}
          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="w-full object-cover max-h-96"
            />
          )}

          {/* Post Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500 dark:hover:text-green-400 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-sm font-medium">{post.shares}</span>
              </button>
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Load More */}
      <div className="flex justify-center py-6">
        <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
          Load More Posts
        </button>
      </div>
    </div>
  );
};

export default Feed;
