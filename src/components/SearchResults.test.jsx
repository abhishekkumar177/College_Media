import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchProvider, useSearch } from '../contexts/SearchContext';
import SearchResults from './SearchResults';

// Mock the useSearch hook for testing
const mockUseSearch = {
  searchQuery: 'nature',
  searchFilter: 'all',
  searchResults: {
    posts: [
      {
        id: 1,
        user: { username: 'traveler_adventures', avatar: 'avatar1.jpg' },
        media: 'post1.jpg',
        caption: 'Exploring the hidden gems of nature 🌿 #wanderlust #naturephotography',
        likes: 245,
        comments: 18,
        hashtags: ['wanderlust', 'naturephotography']
      }
    ],
    users: [
      { username: 'nature_lover', avatar: 'avatar2.jpg', followers: 1250 }
    ],
    hashtags: [
      { tag: '#nature', useCount: 15420 }
    ],
    total: 3
  },
  isSearching: false,
  currentPage: 1,
  resultsPerPage: 10,
  setCurrentPage: jest.fn()
};

// Test component that uses the search hook
const TestComponent = () => {
  const search = useSearch();
  return (
    <div>
      <div data-testid="search-query">{search.searchQuery}</div>
      <div data-testid="search-filter">{search.searchFilter}</div>
      <div data-testid="total-results">{search.searchResults.total}</div>
    </div>
  );
};

describe('SearchResults Component', () => {
  beforeEach(() => {
    // Mock the useSearch hook
    jest.spyOn(require('../contexts/SearchContext'), 'useSearch').mockReturnValue(mockUseSearch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders search results correctly', () => {
    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    // Check if search results header is displayed
    expect(screen.getByText('Search Results for "nature"')).toBeInTheDocument();
    expect(screen.getByText('3 results')).toBeInTheDocument();

    // Check if filter tabs are present
    expect(screen.getByText('All (3)')).toBeInTheDocument();
    expect(screen.getByText('Posts (1)')).toBeInTheDocument();
    expect(screen.getByText('Users (1)')).toBeInTheDocument();
    expect(screen.getByText('Hashtags (1)')).toBeInTheDocument();

    // Check if post content is displayed
    expect(screen.getByText('traveler_adventures')).toBeInTheDocument();
    expect(screen.getByText(/Exploring the hidden gems/)).toBeInTheDocument();

    // Check if hashtags are displayed
    expect(screen.getByText('#wanderlust')).toBeInTheDocument();
    expect(screen.getByText('#naturephotography')).toBeInTheDocument();
  });

  test('displays loading state when searching', () => {
    const loadingMock = { ...mockUseSearch, isSearching: true };
    jest.spyOn(require('../contexts/SearchContext'), 'useSearch').mockReturnValue(loadingMock);

    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  test('displays no results message when no search query', () => {
    const noQueryMock = {
      ...mockUseSearch,
      searchQuery: '',
      searchResults: { posts: [], users: [], hashtags: [], total: 0 }
    };
    jest.spyOn(require('../contexts/SearchContext'), 'useSearch').mockReturnValue(noQueryMock);

    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    expect(screen.getByText('Start searching')).toBeInTheDocument();
  });

  test('highlights search terms in results', () => {
    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    // Check if the word "nature" is highlighted in the caption
    const highlightedText = screen.getByText('nature');
    expect(highlightedText).toHaveClass('bg-yellow-200');
  });

  test('filter tabs change active state', () => {
    render(
      <SearchProvider>
        <SearchResults />
      </SearchProvider>
    );

    // The "All" tab should be active by default
    const allTab = screen.getByText('All (3)');
    expect(allTab).toHaveClass('bg-white', 'text-purple-700');
  });
});

describe('SearchContext', () => {
  test('provides search context to child components', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );

    expect(screen.getByTestId('search-query')).toHaveTextContent('nature');
    expect(screen.getByTestId('search-filter')).toHaveTextContent('all');
    expect(screen.getByTestId('total-results')).toHaveTextContent('3');
  });

  test('throws error when useSearch is used outside provider', () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useSearch must be used within a SearchProvider'
    );

    consoleSpy.mockRestore();
  });
});
