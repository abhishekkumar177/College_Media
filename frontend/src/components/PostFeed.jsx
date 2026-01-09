import React, { useState, useEffect, useMemo } from "react";

import CreatePost from "./CreatePost";
import Post from "../components/Post";
import SkeletonPost from "../components/SkeletonPost";
import SearchFilterBar from "./SearchFilterBar";
import { mockPosts } from "../data/post";

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [newPosts, setNewPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    setTimeout(() => {
     
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const getPostUrl = (post) => `https://collegemedia.com/post/${post.id}`;

  const getShareText = (post) =>
    `Check out this post from ${post.user.username}: ${post.caption}`;

  const openShare = (url) => window.open(url, "_blank");

  const handleShareWhatsApp = (post) =>
    openShare(
      `https://wa.me/?text=${encodeURIComponent(
        getShareText(post) + " " + getPostUrl(post)
      )}`
    );

  const handleShareTelegram = (post) =>
    openShare(
      `https://t.me/share/url?url=${encodeURIComponent(
        getPostUrl(post)
      )}&text=${encodeURIComponent(getShareText(post))}`
    );

  const handleShareTwitter = (post) =>
    openShare(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        getShareText(post)
      )}&url=${encodeURIComponent(getPostUrl(post))}`
    );

  const handleShareFacebook = (post) =>
    openShare(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        getPostUrl(post)
      )}`
    );

  const handleShareLinkedIn = (post) =>
    openShare(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        getPostUrl(post)
      )}`
    );

  const handleShareEmail = (post) =>
    openShare(
      `mailto:?subject=CollegeMedia Post&body=${encodeURIComponent(
        getShareText(post) + "\n\n" + getPostUrl(post)
      )}`
    );

  const handleCopyLink = (post) => {
    navigator.clipboard.writeText(getPostUrl(post));
    setCopiedLink(post.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleNewPost = (post) => {
    setNewPosts((prev) => [post, ...prev]);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
    setFilterType("all");
  };

  // Parse timestamp to Date for sorting
  const parseTimestamp = (timestamp) => {
    const now = new Date();
    const match = timestamp.match(/(\d+)\s+(hour|minute|day|week|month)s?\s+ago/);
    
    if (!match) return now;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const date = new Date(now);
    switch (unit) {
      case "minute":
        date.setMinutes(date.getMinutes() - value);
        break;
      case "hour":
        date.setHours(date.getHours() - value);
        break;
      case "day":
        date.setDate(date.getDate() - value);
        break;
      case "week":
        date.setDate(date.getDate() - (value * 7));
        break;
      case "month":
        date.setMonth(date.getMonth() - value);
        break;
      default:
        break;
    }
    return date;
  };

  // Memoized filtered and sorted posts
  const filteredAndSortedPosts = useMemo(() => {
    let allPosts = [...newPosts, ...posts];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allPosts = allPosts.filter(
        (post) =>
          post.caption?.toLowerCase().includes(query) ||
          post.user?.username?.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (filterType === "liked") {
      allPosts = allPosts.filter((post) => post.liked);
    } else if (filterType === "recent") {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      allPosts = allPosts.filter((post) => {
        const postDate = parseTimestamp(post.timestamp);
        return postDate >= twentyFourHoursAgo;
      });
    }
    
    // Apply sorting
    switch (sortBy) {
      case "oldest":
        allPosts.sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));
        break;
      case "mostLiked":
        allPosts.sort((a, b) => b.likes - a.likes);
        break;
      case "mostCommented":
        allPosts.sort((a, b) => b.comments - a.comments);
        break;
      case "newest":
      default:
        allPosts.sort((a, b) => parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp));
        break;
    }
    
    return allPosts;
  }, [posts, newPosts, searchQuery, sortBy, filterType]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SkeletonPost />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreatePost onPostCreated={handleNewPost} />

      {/* Search and Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterType={filterType}
        onFilterChange={setFilterType}
        onClearFilters={handleClearFilters}
      />

      {/* Posts Display */}
      {filteredAndSortedPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No posts found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        filteredAndSortedPosts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onShareWhatsApp={handleShareWhatsApp}
            onShareTelegram={handleShareTelegram}
            onShareTwitter={handleShareTwitter}
            onShareFacebook={handleShareFacebook}
            onShareLinkedIn={handleShareLinkedIn}
            onShareEmail={handleShareEmail}
            onCopyLink={handleCopyLink}
            copiedLink={copiedLink}
          />
        ))
      )}
    </div>
  );
};

export default PostFeed;
