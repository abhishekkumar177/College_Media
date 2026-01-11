import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import SearchBar from "../components/SearchBar";
import SearchFilters from "../components/SearchFilters";
import SearchResultItem from "../components/SearchResultItem";
import { searchApi } from "../api/endpoints";
import { addToSearchHistory } from "../utils/searchHistory";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    dateRange: "all",
    sortBy: "relevance",
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch search results
  
  const fetchResults = async (pageNum) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchApi.search(query, {
        ...filters,
        page: pageNum,
        limit: 20,
      });

      if (pageNum === 1) {
        setResults(data.results || []);
      } else {
        setResults((prev) => [...prev, ...(data.results || [])]);
      }

      setTotalResults(data.total || 0);
      setHasMore(data.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchResults(page + 1);
    }
  };

useEffect(() => {
    if (query) {
      fetchResults(1);
      addToSearchHistory(query);
    }
  }, [query, filters]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        handleLoadMore();
      }
    };

    if (hasMore && !loading) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, page]);

  // Filter results by type for tabs
  const getFilteredResults = (type) => {
    if (type === "all") return results;
    return results.filter((r) => r.type === type);
  };

  const tabCounts = {
    all: totalResults,
    posts: results.filter((r) => r.type === "post").length,
    users: results.filter((r) => r.type === "user").length,
    comments: results.filter((r) => r.type === "comment").length,
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Icon
              icon="mdi:magnify"
              width={64}
              className="text-gray-400 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Search College Media
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Find posts, users, and comments across the platform
            </p>
            <div className="w-full max-w-2xl mt-8">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Search Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalResults} {totalResults === 1 ? "result" : "results"} found
          </p>
        </div>

        {/* Filters */}
        <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Type Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {["all", "posts", "users", "comments"].map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange({ type })}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filters.type === type
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="ml-2 text-xs opacity-75">
                ({tabCounts[type] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Results */}
        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Icon
              icon="mdi:loading"
              width={48}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Icon
              icon="mdi:magnify-close"
              width={64}
              className="text-gray-400 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
              We couldn't find anything matching "{query}". Try adjusting your
              filters or search term.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Try different keywords</p>
              <p>• Check your spelling</p>
              <p>• Try more general terms</p>
              <p>• Adjust your filters</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {getFilteredResults(filters.type).map((result) => (
                <SearchResultItem
                  key={`${result.type}-${result.id}`}
                  result={result}
                  query={query}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                {loading ? (
                  <Icon
                    icon="mdi:loading"
                    width={32}
                    className="animate-spin text-blue-600 mx-auto"
                  />
                ) : (
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Load More Results
                  </button>
                )}
              </div>
            )}

            {/* End Message */}
            {!hasMore && results.length > 0 && (
              <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
                <p>You've reached the end of the results</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
