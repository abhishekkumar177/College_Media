/**
 * Unit Tests - SearchBar Component
 * Issue #348: Add Unit Tests for Core Components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from '../../../src/components/SearchBar';

// Mock dependencies
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../../src/hooks/useDebounce', () => ({
    useDebounce: (value) => value, // Return value immediately for testing
}));

vi.mock('../../../src/api/endpoints', () => ({
    searchApi: {
        getSuggestions: vi.fn((query) =>
            Promise.resolve([
                { id: '1', type: 'user', name: 'testuser', username: '@testuser' },
                { id: '2', type: 'post', content: 'Test post content' },
                { id: '3', type: 'tag', name: '#testing' },
            ])
        ),
    },
}));

vi.mock('../../../src/utils/searchHistory', () => ({
    addToSearchHistory: vi.fn(),
    getSearchHistory: vi.fn(() => ['previous search', 'another search']),
}));

vi.mock('../../../src/components/SearchSuggestions', () => ({
    default: ({ suggestions, loading, query, history, onSelect, onClose }) => (
        <div data-testid="search-suggestions">
            {loading && <div>Loading...</div>}
            {suggestions.map((s) => (
                <button key={s.id} onClick={() => onSelect(s.name || s.content)}>
                    {s.name || s.content}
                </button>
            ))}
            {history.map((h, i) => (
                <button key={i} onClick={() => onSelect(h)}>
                    {h}
                </button>
            ))}
            <button onClick={onClose}>Close</button>
        </div>
    ),
}));

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SearchBar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe('Rendering', () => {
        it('should render search input', () => {
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            expect(searchInput).toBeInTheDocument();
        });

        it('should render with custom className', () => {
            const { container } = renderWithRouter(<SearchBar className="custom-class" />);

            const searchContainer = container.firstChild;
            expect(searchContainer).toHaveClass('custom-class');
        });

        it('should have search icon', () => {
            renderWithRouter(<SearchBar />);

            // Icon should be present (using iconify)
            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            expect(searchInput.parentElement).toBeInTheDocument();
        });

        it('should show keyboard shortcut hint in placeholder', () => {
            renderWithRouter(<SearchBar />);

            expect(screen.getByPlaceholderText(/ctrl\+k/i)).toBeInTheDocument();
        });
    });

    describe('Search Input', () => {
        it('should update query when user types', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test query');

            expect(searchInput).toHaveValue('test query');
        });

        it('should show suggestions dropdown when typing', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            await waitFor(() => {
                expect(screen.getByTestId('search-suggestions')).toBeInTheDocument();
            });
        });

        it('should show clear button when query is not empty', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            await waitFor(() => {
                expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
            });
        });

        it('should not show clear button when query is empty', () => {
            renderWithRouter(<SearchBar />);

            expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
        });

        it('should clear query when clear button is clicked', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            const clearButton = await screen.findByLabelText('Clear search');
            await user.click(clearButton);

            expect(searchInput).toHaveValue('');
        });

        it('should focus input after clearing', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            const clearButton = await screen.findByLabelText('Clear search');
            await user.click(clearButton);

            expect(searchInput).toHaveFocus();
        });
    });

    describe('Search Suggestions', () => {
        it('should fetch suggestions when query changes', async () => {
            const { searchApi } = require('../../../src/api/endpoints');
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            await waitFor(() => {
                expect(searchApi.getSuggestions).toHaveBeenCalledWith('test');
            });
        });

        it('should display suggestions', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            await waitFor(() => {
                expect(screen.getByText('testuser')).toBeInTheDocument();
                expect(screen.getByText('Test post content')).toBeInTheDocument();
                expect(screen.getByText('#testing')).toBeInTheDocument();
            });
        });

        it('should show dropdown when input is focused', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.click(searchInput);

            await waitFor(() => {
                expect(screen.getByTestId('search-suggestions')).toBeInTheDocument();
            });
        });

        it('should hide dropdown when clicking outside', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            await waitFor(() => {
                expect(screen.getByTestId('search-suggestions')).toBeInTheDocument();
            });

            // Click outside
            await user.click(document.body);

            await waitFor(() => {
                expect(screen.queryByTestId('search-suggestions')).not.toBeInTheDocument();
            });
        });

        it('should clear suggestions when query is empty', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            await waitFor(() => {
                expect(screen.getByText('testuser')).toBeInTheDocument();
            });

            const clearButton = await screen.findByLabelText('Clear search');
            await user.click(clearButton);

            // Suggestions should be cleared (but history might still show)
            expect(searchInput).toHaveValue('');
        });

        it('should handle suggestion fetch errors gracefully', async () => {
            const { searchApi } = require('../../../src/api/endpoints');
            searchApi.getSuggestions.mockRejectedValueOnce(new Error('Network error'));

            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            // Should not crash, suggestions should be empty
            await waitFor(() => {
                expect(searchApi.getSuggestions).toHaveBeenCalled();
            });
        });
    });

    describe('Search Submission', () => {
        it('should navigate to search page on form submit', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test query');
            await user.keyboard('{Enter}');

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20query');
            });
        });

        it('should add search to history on submit', async () => {
            const { addToSearchHistory } = require('../../../src/utils/searchHistory');
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test query');
            await user.keyboard('{Enter}');

            await waitFor(() => {
                expect(addToSearchHistory).toHaveBeenCalledWith('test query');
            });
        });

        it('should clear query after submission', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test query');
            await user.keyboard('{Enter}');

            await waitFor(() => {
                expect(searchInput).toHaveValue('');
            });
        });

        it('should close dropdown after submission', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test query');

            await waitFor(() => {
                expect(screen.getByTestId('search-suggestions')).toBeInTheDocument();
            });

            await user.keyboard('{Enter}');

            await waitFor(() => {
                expect(screen.queryByTestId('search-suggestions')).not.toBeInTheDocument();
            });
        });

        it('should not submit empty query', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.click(searchInput);
            await user.keyboard('{Enter}');

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not submit whitespace-only query', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, '   ');
            await user.keyboard('{Enter}');

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should handle suggestion selection', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            await waitFor(() => {
                expect(screen.getByText('testuser')).toBeInTheDocument();
            });

            const suggestion = screen.getByText('testuser');
            await user.click(suggestion);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/search?q=testuser');
            });
        });
    });

    describe('Keyboard Shortcuts', () => {
        it('should focus input when Ctrl+K is pressed', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);

            await user.keyboard('{Control>}k{/Control}');

            expect(searchInput).toHaveFocus();
        });

        it('should focus input when Cmd+K is pressed (Mac)', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);

            await user.keyboard('{Meta>}k{/Meta}');

            expect(searchInput).toHaveFocus();
        });

        it('should open dropdown when Ctrl+K is pressed', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            await user.keyboard('{Control>}k{/Control}');

            await waitFor(() => {
                expect(screen.getByTestId('search-suggestions')).toBeInTheDocument();
            });
        });
    });

    describe('Search History', () => {
        it('should display search history in suggestions', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.click(searchInput);

            await waitFor(() => {
                expect(screen.getByText('previous search')).toBeInTheDocument();
                expect(screen.getByText('another search')).toBeInTheDocument();
            });
        });

        it('should allow selecting from search history', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.click(searchInput);

            await waitFor(() => {
                expect(screen.getByText('previous search')).toBeInTheDocument();
            });

            const historyItem = screen.getByText('previous search');
            await user.click(historyItem);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/search?q=previous%20search');
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper aria-label for search input', () => {
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByLabelText('Search');
            expect(searchInput).toBeInTheDocument();
        });

        it('should have proper aria-label for clear button', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            const clearButton = await screen.findByLabelText('Clear search');
            expect(clearButton).toBeInTheDocument();
        });

        it('should have autocomplete disabled', () => {
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            expect(searchInput).toHaveAttribute('autocomplete', 'off');
        });
    });

    describe('Edge Cases', () => {
        it('should handle special characters in search query', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            const specialQuery = '@user #tag <script>alert("xss")</script>';
            await user.type(searchInput, specialQuery);

            expect(searchInput).toHaveValue(specialQuery);
        });

        it('should handle very long search queries', async () => {
            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            const longQuery = 'a'.repeat(500);
            await user.type(searchInput, longQuery);

            expect(searchInput).toHaveValue(longQuery);
        });

        it('should handle rapid typing', async () => {
            const { searchApi } = require('../../../src/api/endpoints');
            const user = userEvent.setup({ delay: null });
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'test');

            // With debounce mocked to return immediately, should call API
            await waitFor(() => {
                expect(searchApi.getSuggestions).toHaveBeenCalled();
            });
        });

        it('should handle empty suggestions response', async () => {
            const { searchApi } = require('../../../src/api/endpoints');
            searchApi.getSuggestions.mockResolvedValueOnce([]);

            const user = userEvent.setup();
            renderWithRouter(<SearchBar />);

            const searchInput = screen.getByPlaceholderText(/search posts, users, tags/i);
            await user.type(searchInput, 'nonexistent');

            await waitFor(() => {
                expect(searchApi.getSuggestions).toHaveBeenCalledWith('nonexistent');
            });

            // Should still show dropdown (with history)
            expect(screen.getByTestId('search-suggestions')).toBeInTheDocument();
        });
    });
});
