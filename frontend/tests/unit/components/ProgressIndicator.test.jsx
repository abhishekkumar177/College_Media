import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressIndicator from '../../../src/components/ProgressIndicator';
import { AccessibilityProvider } from '../../../src/context/AccessibilityContext';

// Mock the accessibility context
vi.mock('../../../src/context/AccessibilityContext', () => ({
    useAccessibility: vi.fn(),
    AccessibilityProvider: ({ children }) => <div>{children}</div>
}));

describe('ProgressIndicator Component', () => {
    const mockUseAccessibility = vi.mocked(require('../../../src/context/AccessibilityContext').useAccessibility);

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAccessibility.mockReturnValue({
            getProgressIndicator: vi.fn(),
            updateProgressIndicator: vi.fn(),
            announce: vi.fn()
        });
    });

    it('renders linear progress indicator with default props', () => {
        render(<ProgressIndicator />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '0');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '100');
        expect(progressBar).toHaveAttribute('aria-label', 'Loading...');
    });

    it('renders circular progress indicator', () => {
        render(<ProgressIndicator variant="circular" />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();

        // Should contain SVG for circular progress
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('displays custom label', () => {
        render(<ProgressIndicator label="Uploading file..." />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-label', 'Uploading file...');
    });

    it('shows percentage when showPercentage is true', () => {
        render(<ProgressIndicator value={75} showPercentage={true} />);

        expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('hides percentage when showPercentage is false', () => {
        render(<ProgressIndicator value={75} showPercentage={false} />);

        expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(<ProgressIndicator className="custom-progress" />);

        const container = screen.getByRole('progressbar').closest('.progress-indicator') || screen.getByRole('progressbar').parentElement;
        expect(container).toHaveClass('custom-progress');
    });

    it('handles different sizes', () => {
        const { rerender } = render(<ProgressIndicator size="small" />);
        expect(document.querySelector('.h-1')).toBeInTheDocument();

        rerender(<ProgressIndicator size="medium" />);
        expect(document.querySelector('.h-2')).toBeInTheDocument();

        rerender(<ProgressIndicator size="large" />);
        expect(document.querySelector('.h-3')).toBeInTheDocument();
    });

    it('updates progress value correctly', () => {
        const { rerender } = render(<ProgressIndicator value={25} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');

        rerender(<ProgressIndicator value={80} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80');
    });

    it('handles custom max value', () => {
        render(<ProgressIndicator value={50} max={200} />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuemax', '200');
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('renders screen reader text for accessibility', () => {
        render(<ProgressIndicator value={60} label="Processing..." showPercentage={true} />);

        const srText = screen.getByText('Processing... 60% complete');
        expect(srText).toHaveClass('sr-only');
    });

    it('uses context data when id is provided', () => {
        const mockIndicator = {
            id: 'test-progress',
            value: 45,
            label: 'Context Label',
            showPercentage: true
        };

        mockUseAccessibility.mockReturnValue({
            getProgressIndicator: vi.fn().mockReturnValue(mockIndicator),
            updateProgressIndicator: vi.fn(),
            announce: vi.fn()
        });

        render(<ProgressIndicator id="test-progress" />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '45');
        expect(progressBar).toHaveAttribute('aria-label', 'Context Label');
    });

    it('falls back to props when context indicator not found', () => {
        mockUseAccessibility.mockReturnValue({
            getProgressIndicator: vi.fn().mockReturnValue(null),
            updateProgressIndicator: vi.fn(),
            announce: vi.fn()
        });

        render(<ProgressIndicator id="nonexistent" value={30} label="Fallback Label" />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '30');
        expect(progressBar).toHaveAttribute('aria-label', 'Fallback Label');
    });

    it('handles edge cases gracefully', () => {
        // Test with value exceeding max
        render(<ProgressIndicator value={150} max={100} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '150');

        // Test with negative value
        render(<ProgressIndicator value={-10} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '-10');

        // Test with zero max (should not crash)
        render(<ProgressIndicator value={50} max={0} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '0');
    });

    it('circular variant handles different sizes', () => {
        const { rerender } = render(<ProgressIndicator variant="circular" size="small" />);
        expect(document.querySelector('svg')).toBeInTheDocument();

        rerender(<ProgressIndicator variant="circular" size="large" />);
        expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('circular variant shows percentage correctly', () => {
        render(<ProgressIndicator variant="circular" value={75} showPercentage={true} />);

        expect(screen.getByText('75%')).toBeInTheDocument();
    });
});