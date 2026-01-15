import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Search Context for managing global search state and functionality
 * Provides search query, results, filtering, and recommendation features
 */
const SearchContext = createContext();

/**
 * SearchProvider component that wraps the app and provides search functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Search provider wrapper
 */
export const SearchProvider = ({ children }) => {
  // ============= SEARCH STATE =============

  /** Current search query string */
  const [searchQuery, setSearchQuery] = useState("");

  /** Active search filter type: 'all', 'posts', 'users', 'hashtags' */
  const [searchFilter, setSearchFilter] = useState("all");

  /** Search results organized by type */
  const [searchResults, setSearchResults] = useState({
    posts: [],
    users: [],
    hashtags: [],
    total: 0
  });

  /** Loading state for search operations */
  const [isSearching, setIsSearching] = useState(false);

  /** Current page for pagination */
  const [currentPage, setCurrentPage] = useState(1);

  /** Results per page */
  const [resultsPerPage] = useState(10);

  // ============= RECOMMENDATION STATE =============

  /** Trending hashtags for recommendations */
  const [trendingHashtags, setTrendingHashtags] = useState([]);

  /** Suggested users based on search/recommendations */
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  /** Recent searches for quick access */
  const [recentSearches, setRecentSearches] = useState([]);

  // ============= SEARCH FUNCTIONS =============

  /**
   * Perform search across all data types
   * @param {string} query - Search query
   * @param {string} filter - Filter type ('all', 'posts', 'users', 'hashtags')
   */
  const performSearch = async (query, filter = 'all') => {
    if (!query.trim()) {
      setSearchResults({ posts: [], users: [], hashtags: [], total: 0 });
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    setSearchFilter(filter);

    try {
      // Mock data - in production this would call backend APIs
      const mockPosts = [
        {
          id: 1,
          user: { username: "traveler_adventures", avatar: "https://placehold.co/40x40/FF6B6B/FFFFFF?text=TA" },
          media: "https://placehold.co/500x600/4ECDC4/FFFFFF?text=Beautiful+Landscape",
          caption: "Exploring the hidden gems of nature 🌿 #wanderlust #naturephotography",
          likes: 245,
          comments: 18,
          hashtags: ["wanderlust", "naturephotography"]
        },
        {
          id: 2,
          user: { username: "foodie_delights", avatar: "https://placehold.co/40x40/45B7D1/FFFFFF?text=FD" },
          media: "https://placehold.co/500x600/FFEAA7/FFFFFF?text=Delicious+Food",
          caption: "Just tried the best pasta in town! 🍝 Tag someone who needs to try this! #foodie #pasta",
          likes: 892,
          comments: 43,
          hashtags: ["foodie", "pasta"]
        },
        {
          id: 3,
          user: { username: "fitness_motivation", avatar: "https://placehold.co/40x40/96CEB4/FFFFFF?text=FM" },
          media: "https://placehold.co/500x600/DDA0DD/FFFFFF?text=Workout+Session",
          caption: "Consistency is key 💪 Day 45 of my fitness journey! #fitness #gymmotivation",
          likes: 1567,
          comments: 89,
          hashtags: ["fitness", "gymmotivation"]
        }
      ];

      const mockUsers = [
        { username: "traveler_adventures", avatar: "https://placehold.co/40x40/FF6B6B/FFFFFF?text=TA", followers: 1250 },
        { username: "foodie_delights", avatar: "https://placehold.co/40x40/45B7D1/FFFFFF?text=FD", followers: 892 },
        { username: "fitness_motivation", avatar: "https://placehold.co/40x40/96CEB4/FFFFFF?text=FM", followers: 1567 },
        { username: "tech_guru", avatar: "https://placehold.co/32x32/FF6B6B/FFFFFF?text=TG", followers: 2100 },
        { username: "art_lover", avatar: "https://placehold.co/32x32/4ECDC4/FFFFFF?text=AL", followers: 850 }
      ];

      const mockHashtags = [
        { tag: "#photography", useCount: 15420 },
        { tag: "#travel", useCount: 12890 },
        { tag: "#fashion", useCount: 11200 },
        { tag: "#food", useCount: 9800 },
        { tag: "#art", useCount: 8760 },
        { tag: "#fitness", useCount: 7650 },
        { tag: "#nature", useCount: 6540 },
        { tag: "#music", useCount: 5430 }
      ];

      // Filter results based on query and filter type
      const queryLower = query.toLowerCase();

      let filteredPosts = [];
      let filteredUsers = [];
      let filteredHashtags = [];

      if (filter === 'all' || filter === 'posts') {
        filteredPosts = mockPosts.filter(post =>
          post.caption.toLowerCase().includes(queryLower) ||
          post.hashtags.some(tag => tag.toLowerCase().includes(queryLower)) ||
          post.user.username.toLowerCase().includes(queryLower)
        );
      }

      if (filter === 'all' || filter === 'users') {
        filteredUsers = mockUsers.filter(user =>
          user.username.toLowerCase().includes(queryLower)
        );
      }

      if (filter === 'all' || filter === 'hashtags') {
        filteredHashtags = mockHashtags.filter(hashtag =>
          hashtag.tag.toLowerCase().includes(queryLower)
        );
      }

      // Sort results by relevance (simple implementation)
      filteredPosts.sort((a, b) => {
        const aScore = (a.caption.toLowerCase().includes(queryLower) ? 3 : 0) +
                      (a.hashtags.some(tag => tag.toLowerCase().includes(queryLower)) ? 2 : 0) +
                      (a.user.username.toLowerCase().includes(queryLower) ? 1 : 0);
        const bScore = (b.caption.toLowerCase().includes(queryLower) ? 3 : 0) +
                      (b.hashtags.some(tag => tag.toLowerCase().includes(queryLower)) ? 2 : 0) +
                      (b.user.username.toLowerCase().includes(queryLower) ? 1 : 0);
        return bScore - aScore;
      });

      filteredUsers.sort((a, b) => b.followers - a.followers);
      filteredHashtags.sort((a, b) => b.useCount - a.useCount);

      setSearchResults({
        posts: filteredPosts,
        users: filteredUsers,
        hashtags: filteredHashtags,
        total: filteredPosts.length + filteredUsers.length + filteredHashtags.length
      });

      // Add to recent searches
      if (query.trim() && !recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ posts: [], users: [], hashtags: [], total: 0 });
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Clear search results and reset state
   */
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults({ posts: [], users: [], hashtags: [], total: 0 });
    setCurrentPage(1);
  };

  /**
   * Get trending hashtags (mock implementation)
   */
  const getTrendingHashtags = () => {
    const mockTrending = [
      { tag: "#photography", useCount: 15420, trend: "up" },
      { tag: "#travel", useCount: 12890, trend: "up" },
      { tag: "#fashion", useCount: 11200, trend: "down" },
      { tag: "#food", useCount: 9800, trend: "up" },
      { tag: "#art", useCount: 8760, trend: "stable" }
    ];
    setTrendingHashtags(mockTrending);
  };

  /**
   * Get user recommendations based on search context
   */
  const getUserRecommendations = () => {
    const mockSuggestions = [
      { username: "tech_guru", avatar: "https://placehold.co/32x32/FF6B6B/FFFFFF?text=TG", followers: 2100, reason: "Popular in tech" },
      { username: "art_lover", avatar: "https://placehold.co/32x32/4ECDC4/FFFFFF?text=AL", followers: 850, reason: "Similar interests" },
      { username: "fitness_pro", avatar: "https://placehold.co/32x32/45B7D1/FFFFFF?text=FP", followers: 3200, reason: "Trending creator" }
    ];
    setSuggestedUsers(mockSuggestions);
  };

  // Initialize trending data on mount
  useEffect(() => {
    getTrendingHashtags();
    getUserRecommendations();
  }, []);

  // ============= CONTEXT VALUE =============

  const value = {
    // State
    searchQuery,
    searchFilter,
    searchResults,
    isSearching,
    currentPage,
    resultsPerPage,
    trendingHashtags,
    suggestedUsers,
    recentSearches,

    // Actions
    performSearch,
    clearSearch,
    setSearchFilter,
    setCurrentPage,
    getTrendingHashtags,
    getUserRecommendations
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

/**
 * Custom hook to use search context
 * @returns {Object} Search context value
 */
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext;
