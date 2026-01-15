import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityProvider, useAccessibility } from '../../../src/context/AccessibilityContext';
import AccessibilityAudit from '../../../src/components/AccessibilityAudit';
import ProgressIndicator from '../../../src/components/ProgressIndicator';

// Mock the accessibility utilities
vi.mock('../../../src/utils/accessibility', () => ({
    calculateContrastRatio: vi.fn(() => 4.8),
    validateFormAccessibility: vi.fn(() => ({ valid: true, issues: [] })),
    validateTouchTargets: vi.fn(() => ({ valid: true, issues: [] })),
    announceToScreenReader: vi.fn()
}));

describe('Accessibility Integration Tests', () => {
    let user;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('AccessibilityContext provides form validation feedback', async () => {
        const TestComponent = () => {
            const { setFieldError, getFieldError, clearFieldError } = useAccessibility();

            return (
                <div>
                    <input
                        type="text"
                        data-testid="test-input"
                        onBlur={() => setFieldError('test-field', 'This field is required')}
                    />
                    <button
                        data-testid="clear-error"
                        onClick={() => clearFieldError('test-field')}
                    >
                        Clear Error
                    </button>
                    <span data-testid="error-display">
                        {getFieldError('test-field') || 'No error'}
                    </span>
                </div>
            );
        };

        render(
            <AccessibilityProvider>
                <TestComponent />
            </AccessibilityProvider>
        );

        const input = screen.getByTestId('test-input');
        const errorDisplay = screen.getByTestId('error-display');

        // Initially no error
        expect(errorDisplay).toHaveTextContent('No error');

        // Trigger error
        fireEvent.blur(input);
        await waitFor(() => {
            expect(errorDisplay).toHaveTextContent('This field is required');
        });

        // Clear error
        const clearButton = screen.getByTestId('clear-error');
        await user.click(clearButton);
        await waitFor(() => {
            expect(errorDisplay).toHaveTextContent('No error');
        });
    });

    it('Progress indicators work with context management', async () => {
        const TestComponent = () => {
            const { createProgressIndicator, updateProgressIndicator, getProgressIndicator } = useAccessibility();

            const startProgress = () => {
                const id = createProgressIndicator('test-upload', {
                    label: 'Uploading file...',
                    initialValue: 0
                });
                // Simulate progress updates
                setTimeout(() => updateProgressIndicator(id, 50), 100);
                setTimeout(() => updateProgressIndicator(id, 100), 200);
            };

            const indicator = getProgressIndicator('test-upload');

            return (
                <div>
                    <button data-testid="start-progress" onClick={startProgress}>
                        Start Upload
                    </button>
                    {indicator && (
                        <ProgressIndicator
                            id="test-upload"
                            value={indicator.value}
                            label={indicator.label}
                        />
                    )}
                </div>
            );
        };

        render(
            <AccessibilityProvider>
                <TestComponent />
            </AccessibilityProvider>
        );

        const startButton = screen.getByTestId('start-progress');
        await user.click(startButton);

        // Should show progress indicator
        await waitFor(() => {
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        // Progress should update
        await waitFor(() => {
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', '100');
        });
    });

    it('Accessibility audit integrates with context announcements', async () => {
        const mockAnnounce = vi.fn();

        // Mock the useAccessibility hook for this test
        vi.mocked(useAccessibility).mockReturnValue({
            announce: mockAnnounce,
            getProgressIndicator: vi.fn(),
            updateProgressIndicator: vi.fn(),
            createProgressIndicator: vi.fn(),
            removeProgressIndicator: vi.fn(),
            setFieldError: vi.fn(),
            clearFieldError: vi.fn(),
            getFieldError: vi.fn(),
            preferences: {},
            updatePreference: vi.fn()
        });

        render(
            <AccessibilityProvider>
                <AccessibilityAudit />
            </AccessibilityProvider>
        );

        const auditButton = screen.getByText('Run Accessibility Audit');
        await user.click(auditButton);

        await waitFor(() => {
            expect(mockAnnounce).toHaveBeenCalledWith(
                expect.stringContaining('Accessibility audit complete'),
                'polite'
            );
        });
    });

    it('Form validation integrates with accessibility announcements', async () => {
        const TestForm = () => {
            const { setFieldError, announce } = useAccessibility();

            const handleSubmit = (e) => {
                e.preventDefault();
                setFieldError('email', 'Invalid email format');
                announce('Form validation failed. Please check the highlighted fields.', 'assertive');
            };

            return (
                <form onSubmit={handleSubmit} role="form" aria-labelledby="form-title">
                    <h2 id="form-title" className="sr-only">Contact Form</h2>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            aria-invalid="false"
                            aria-describedby="email-error"
                        />
                        <span id="email-error" role="alert" aria-live="assertive"></span>
                    </div>
                    <button type="submit" data-testid="submit-btn">Submit</button>
                </form>
            );
        };

        render(
            <AccessibilityProvider>
                <TestForm />
            </AccessibilityProvider>
        );

        const submitButton = screen.getByTestId('submit-btn');
        await user.click(submitButton);

        // Check that form has proper accessibility attributes
        const form = screen.getByRole('form');
        expect(form).toHaveAttribute('aria-labelledby', 'form-title');

        const emailInput = screen.getByLabelText('Email');
        expect(emailInput).toHaveAttribute('aria-invalid', 'false');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('Keyboard navigation works with accessibility features', async () => {
        const TestNavigation = () => {
            const { updatePreference } = useAccessibility();

            return (
                <div>
                    <button
                        data-testid="focusable-btn-1"
                        onClick={() => updatePreference('keyboardOnly', true)}
                    >
                        Button 1
                    </button>
                    <button
                        data-testid="focusable-btn-2"
                        onClick={() => updatePreference('keyboardOnly', false)}
                    >
                        Button 2
                    </button>
                    <a href="#" data-testid="focusable-link">Link</a>
                </div>
            );
        };

        render(
            <AccessibilityProvider>
                <TestNavigation />
            </AccessibilityProvider>
        );

        // Test Tab navigation
        const btn1 = screen.getByTestId('focusable-btn-1');
        const btn2 = screen.getByTestId('focusable-btn-2');
        const link = screen.getByTestId('focusable-link');

        // Start with first button
        btn1.focus();
        expect(btn1).toHaveFocus();

        // Tab to next element
        await user.tab();
        expect(btn2).toHaveFocus();

        // Tab to link
        await user.tab();
        expect(link).toHaveFocus();
    });

    it('Screen reader announcements work across components', async () => {
        const mockAnnounce = vi.fn();

        vi.mocked(useAccessibility).mockReturnValue({
            announce: mockAnnounce,
            getProgressIndicator: vi.fn(),
            updateProgressIndicator: vi.fn(),
            createProgressIndicator: vi.fn(),
            removeProgressIndicator: vi.fn(),
            setFieldError: vi.fn(),
            clearFieldError: vi.fn(),
            getFieldError: vi.fn(),
            preferences: { reducedMotion: false },
            updatePreference: vi.fn()
        });

        const TestAnnouncements = () => {
            const { announce } = useAccessibility();

            return (
                <div>
                    <button
                        data-testid="announce-btn"
                        onClick={() => announce('Test announcement', 'polite')}
                    >
                        Announce
                    </button>
                    <ProgressIndicator
                        id="test-progress"
                        value={75}
                        label="Loading data..."
                    />
                </div>
            );
        };

        render(
            <AccessibilityProvider>
                <TestAnnouncements />
            </AccessibilityProvider>
        );

        const announceButton = screen.getByTestId('announce-btn');
        await user.click(announceButton);

        expect(mockAnnounce).toHaveBeenCalledWith('Test announcement', 'polite');

        // Check for screen reader text in progress indicator
        const srText = screen.getByText('Loading data... 75% complete');
        expect(srText).toHaveClass('sr-only');
    });
});