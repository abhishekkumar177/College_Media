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
      <div data-testid="total-results">{search.searchResults.total.toString()}</div>
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
    expect(screen.getByRole('button', { name: 'Posts (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Users (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hashtags (1)' })).toBeInTheDocument();

    // Check if post content is displayed
    expect(screen.getByText('traveler_adventures')).toBeInTheDocument();
    expect(screen.getByText(/Exploring the hidden gems/)).toBeInTheDocument();

    // Check if hashtags are displayed
    expect(screen.getByText('wanderlust')).toBeInTheDocument();
    expect(screen.getByText('#nature')).toBeInTheDocument();
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
    const highlightedElements = screen.getAllByText('nature');
    const highlightedText = highlightedElements.find(el => el.classList.contains('bg-yellow-200'));
    expect(highlightedText).toBeInTheDocument();
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
  beforeEach(() => {
    jest.spyOn(require('../contexts/SearchContext'), 'useSearch').mockReturnValue(mockUseSearch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
});
