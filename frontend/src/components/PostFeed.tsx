import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

import CreatePost from "./CreatePost";
import Post from "../components/Post";
import SkeletonPost from "../components/SkeletonPost";
import SearchFilterBar from "./SearchFilterBar";
import { mockPosts } from "../data/post";
import postsAPI, { Post as IPost } from "../services/postsService";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

const PostFeed = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [newPosts, setNewPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");

  // Check if mock data should be used
  const useMockData = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

  // API fetch function
  const fetchPosts = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    try {
      if (useMockData) {
        // Use mock data
        return new Promise<IPost[]>((resolve) => {
          setTimeout(() => {
            const startIndex = (page - 1) * PAGE_SIZE;
            const newChunk = mockPosts.slice(startIndex, startIndex + PAGE_SIZE);
            resolve(newChunk);
          }, 1000);
        });
      } else {
        // Use real API
        const response = await postsAPI.getFeed({
          page,
          limit: PAGE_SIZE,
          sortBy: sortBy as 'newest' | 'oldest' | 'popular',
          filter: filterType !== 'all' ? filterType : undefined,
        });

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch posts');
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }, [useMockData, sortBy, filterType]);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const initialPosts = await fetchPosts(1, false);
        setPosts(initialPosts);
        setHasMore(initialPosts.length === PAGE_SIZE);
      } catch (error) {
        console.error('Error loading posts:', error);
        setError('Failed to load posts. Please try again.');
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchPosts]);

  // Infinite Scroll Callback
  const loadMorePosts = useCallback(async () => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);
      const currentPage = Math.floor(posts.length / PAGE_SIZE) + 1;
      const nextPosts = await fetchPosts(currentPage, true);

      if (nextPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...nextPosts]);
        // If we fetched fewer than PAGE_SIZE, we reached the end
        if (nextPosts.length < PAGE_SIZE) setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      toast.error('Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  }, [posts.length, fetchPosts, loadingMore]);

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

  const handleLike = async (postId: string) => {
    try {
      // Find the post to update optimistically
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Optimistic update
      const wasLiked = post.liked;
      const newLikes = wasLiked ? post.likes - 1 : post.likes + 1;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              liked: !wasLiked,
              likes: newLikes,
            }
            : p
        )
      );

      // Make API call
      if (wasLiked) {
        await postsAPI.unlike(postId);
      } else {
        await postsAPI.like(postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              liked: post.liked,
              likes: post.likes,
            }
            : p
        )
      );
      toast.error('Failed to update like');
    }
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
        <div className="bg-bg-secondary rounded-lg shadow-md p-8 text-center">
          <p className="text-text-muted text-lg">{t('postFeed.noPosts')}</p>
          <p className="text-gray-400 text-sm mt-2">
            {t('postFeed.adjustFilters')}
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
            <div className="text-center py-8 text-text-muted text-sm">
              {t('postFeed.endOfFeed')}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default PostFeed;

