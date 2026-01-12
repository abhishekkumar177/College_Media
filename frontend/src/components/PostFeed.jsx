import React, { useState, useEffect, useMemo, useCallback } from "react";

import CreatePost from "./CreatePost";
import Post from "../components/Post";
import SkeletonPost from "../components/SkeletonPost";
import SearchFilterBar from "./SearchFilterBar";
import { mockPosts } from "../data/post";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [newPosts, setNewPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");

  // Simulate API fetch function
  const fetchPosts = useCallback(async (startIndex) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, you would pass filter/sort params to backend here.
        // For mock data, we just slice the array.
        const newChunk = mockPosts.slice(startIndex, startIndex + PAGE_SIZE);
        resolve(newChunk);
      }, 1000);
    });
  }, []);

  // Initial Load
  useEffect(() => {
    setTimeout(() => {

      setPosts(mockPosts);
      setLoading(false);
      if (initialPosts.length < PAGE_SIZE) setHasMore(false);
    };
    init();
  }, [fetchPosts]);

  // Infinite Scroll Callback
  const loadMorePosts = useCallback(async () => {
    const nextPosts = await fetchPosts(posts.length);
    if (nextPosts.length === 0) {
      setHasMore(false);
    } else {
      setPosts((prev) => [...prev, ...nextPosts]);
      // If we fetched fewer than PAGE_SIZE, we reached the end
      if (nextPosts.length < PAGE_SIZE) setHasMore(false);
    }
  }, [posts.length, fetchPosts]);

  const { lastElementRef, isFetching } = useInfiniteScroll(loadMorePosts, {
    hasMore,
    rootMargin: '100px' // Start loading 100px before end
  });

  // Infinite Scroll Handler with Throttle
  const handleLoadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    console.log("Loading more posts... (Throttled)");

    // Simulate loading more posts
    setTimeout(() => {
      // Just duplicate posts for demo to show scrolling works
      setPosts(prev => [...prev, ...mockPosts.map(p => ({ ...p, id: p.id + Date.now() }))]);
      setLoadingMore(false);
    }, 1500);
  };

  useInfiniteScroll(handleLoadMore, {
    loading: loading || loadingMore,
    hasMore: true,
    throttleLimit: 500 // Configurable limit
  });

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

  if (loading && !posts.length) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SkeletonPost count={3} />
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
        <>
          {filteredAndSortedPosts.map((post, index) => {
            // Attach ref to the last element
            const isLast = index === filteredAndSortedPosts.length - 1;
            return (
              <div key={post.id} ref={isLast ? lastElementRef : null}>
                <Post
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
              </div>
            );
          })}

          {/* Loading indicator for infinite scroll */}
          {isFetching && (
            <div className="py-4">
              <SkeletonPost count={1} />
            </div>
          )}

          {/* End of Feed Message */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              You've reached the end of the feed! 🎉
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default PostFeed;
