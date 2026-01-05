import React, { useState, useEffect, useRef } from "react";
import PostFeed from "../components/PostFeed";
import SkeletonPost from "../components/SkeletonPost";
import SEO from "../components/Seo";

const Home = () => {
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [shareMenuOpen, setShareMenuOpen] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({}); // Track expanded posts
  const shareMenuRef = useRef(null);

  const MAX_CAPTION_LENGTH = 150; // Characters to show when collapsed

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShareMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Generate post URL
  const getPostUrl = (post) => {
    return `https://collegemedia.com/post/${post.id}`;
  };

  // Generate share text
  const getShareText = (post) => {
    return `Check out this post from ${post.user.username}: ${post.caption}`;
  };

  // Share Functions
  const handleShareWhatsApp = (post) => {
    const text = getShareText(post);
    const url = getPostUrl(post);
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(shareUrl, '_blank');
    setShareMenuOpen(null);
  };

  const handleShareLinkedIn = (post) => {
    const url = getPostUrl(post);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
    setShareMenuOpen(null);
  };

  const handleShareTwitter = (post) => {
    const text = getShareText(post);
    const url = getPostUrl(post);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=CollegeMedia`;
    window.open(shareUrl, '_blank');
    setShareMenuOpen(null);
  };

  const handleShareFacebook = (post) => {
    const url = getPostUrl(post);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
    setShareMenuOpen(null);
  };

  const handleShareTelegram = (post) => {
    const text = getShareText(post);
    const url = getPostUrl(post);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    setShareMenuOpen(null);
  };

  const handleShareEmail = (post) => {
    const text = getShareText(post);
    const url = getPostUrl(post);
    const subject = `Check out this post from ${post.user.username} on CollegeMedia`;
    const body = `${text}\n\n${url}\n\nShared from CollegeMedia - The college social network`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setShareMenuOpen(null);
  };

  const handleCopyLink = (post) => {
    const url = getPostUrl(post);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopiedLink(post.id);
          setTimeout(() => setCopiedLink(null), 2000);
          setShareMenuOpen(null);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          fallbackCopyToClipboard(url, post.id);
        });
    } else {
      fallbackCopyToClipboard(url, post.id);
    }
  };

  const fallbackCopyToClipboard = (text, postId) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopiedLink(postId);
      setTimeout(() => setCopiedLink(null), 2000);
      setShareMenuOpen(null);
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  const toggleShareMenu = (postId) => {
    setShareMenuOpen(shareMenuOpen === postId ? null : postId);
  };

  // Toggle read more/less for a specific post
  const toggleReadMore = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Format caption with read more/less
  const formatCaption = (post) => {
    const isExpanded = expandedPosts[post.id] || false;
    
    if (isExpanded || post.caption.length <= MAX_CAPTION_LENGTH) {
      return post.caption;
    }
    
    // Truncate to the last complete word before MAX_CAPTION_LENGTH
    const truncated = post.caption.substring(0, MAX_CAPTION_LENGTH);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  };

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

  return (
    <div className="space-y-6" ref={shareMenuRef}>
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

            {/* Post Content with Read More/Less */}
            <div className="px-5 pb-4">
              <p className="text-gray-800 mb-3 leading-relaxed">
                {formatCaption(post)}
                {post.caption.length > MAX_CAPTION_LENGTH && (
                  <button
                    onClick={() => toggleReadMore(post.id)}
                    className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm focus:outline-none"
                  >
                    {expandedPosts[post.id] ? ' Read Less' : ' Read More'}
                  </button>
                )}
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
                  {/* Like Button */}
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

                  {/* Comment Button */}
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

                  {/* ===== SHARE BUTTON WITH DROPDOWN ===== */}
                  <div className="relative">
                    <button
                      onClick={() => toggleShareMenu(post.id)}
                      className="flex items-center space-x-2 group"
                    >
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

                    {/* Share Dropdown Menu */}
                    {shareMenuOpen === post.id && (
                      <div className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 mb-3 text-center">Share Post</h3>
                          
                          <div className="space-y-1">
                            {/* WhatsApp */}
                            <button
                              onClick={() => handleShareWhatsApp(post)}
                              className="flex items-center w-full p-2 text-left hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-green-600 font-bold text-sm">WA</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">WhatsApp</p>
                                <p className="text-xs text-gray-500">Share with friends</p>
                              </div>
                            </button>

                            {/* LinkedIn */}
                            <button
                              onClick={() => handleShareLinkedIn(post)}
                              className="flex items-center w-full p-2 text-left hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-bold text-sm">in</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">LinkedIn</p>
                                <p className="text-xs text-gray-500">Share professionally</p>
                              </div>
                            </button>

                            {/* Twitter */}
                            <button
                              onClick={() => handleShareTwitter(post)}
                              className="flex items-center w-full p-2 text-left hover:bg-sky-50 rounded-lg transition-colors"
                            >
                              <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Twitter</p>
                                <p className="text-xs text-gray-500">Tweet this post</p>
                              </div>
                            </button>

                            {/* Facebook */}
                            <button
                              onClick={() => handleShareFacebook(post)}
                              className="flex items-center w-full p-2 text-left hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Facebook</p>
                                <p className="text-xs text-gray-500">Share on timeline</p>
                              </div>
                            </button>

                            {/* Copy Link */}
                            <button
                              onClick={() => handleCopyLink(post)}
                              className="flex items-center w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                {copiedLink === post.id ? (
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {copiedLink === post.id ? 'Link Copied!' : 'Copy Link'}
                                </p>
                                <p className="text-xs text-gray-500">Copy post URL</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bookmark Button */}
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

      {/* Fix for React warning - change jsx={true} to jsx="true" */}
      <style jsx="true" global="true">{`
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