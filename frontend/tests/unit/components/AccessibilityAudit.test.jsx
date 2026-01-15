import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccessibilityAudit from '../../../src/components/AccessibilityAudit';
import { AccessibilityProvider } from '../../../src/context/AccessibilityContext';

// Mock the accessibility utilities
vi.mock('../../../src/utils/accessibility', () => ({
    calculateContrastRatio: vi.fn(),
    validateFormAccessibility: vi.fn(),
    validateTouchTargets: vi.fn(),
    announceToScreenReader: vi.fn()
}));

describe('AccessibilityAudit Component', () => {
    const mockCalculateContrastRatio = vi.mocked(require('../../../src/utils/accessibility').calculateContrastRatio);
    const mockValidateFormAccessibility = vi.mocked(require('../../../src/utils/accessibility').validateFormAccessibility);
    const mockValidateTouchTargets = vi.mocked(require('../../../src/utils/accessibility').validateTouchTargets);
    const mockAnnounceToScreenReader = vi.mocked(require('../../../src/utils/accessibility').announceToScreenReader);

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        mockCalculateContrastRatio.mockReturnValue(4.8);
        mockValidateFormAccessibility.mockReturnValue({
            valid: true,
            issues: []
        });
        mockValidateTouchTargets.mockReturnValue({
            valid: true,
            issues: []
        });
    });

    it('renders accessibility audit component', () => {
        render(
            <AccessibilityProvider>
                <AccessibilityAudit />
            </AccessibilityProvider>
        );

        expect(screen.getByText('Accessibility Audit (WCAG 2.1 AA)')).toBeInTheDocument();
        expect(screen.getByText('Run Accessibility Audit')).toBeInTheDocument();
    });

    it('runs audit when button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <AccessibilityProvider>
                <AccessibilityAudit />
            </AccessibilityProvider>
        );

        const auditButton = screen.getByText('Run Accessibility Audit');
        await user.click(auditButton);

        await waitFor(() => {
            expect(mockCalculateContrastRatio).toHaveBeenCalled();
            expect(mockValidateFormAccessibility).toHaveBeenCalled();
            expect(mockValidateTouchTargets).toHaveBeenCalled();
        });
    });

    it('displays audit results after running audit', async () => {
        const user = userEvent.setup();

        // Mock some issues
        mockCalculateContrastRatio.mockReturnValue(3.2); // Below threshold
        mockValidateFormAccessibility.mockReturnValue({
            valid: false,
            issues: ['Missing label on input']
        });
        mockValidateTouchTargets.mockReturnValue({
            valid: false,
            issues: [{
                element: document.createElement('button'),
                issue: 'Touch target too small',
                dimensions: { width: 30, height: 30 }
            }]
        });

        render(
            <AccessibilityProvider>
                <AccessibilityAudit />
            </AccessibilityProvider>
        );

        const auditButton = screen.getByText('Run Accessibility Audit');
        await user.click(auditButton);

        await waitFor(() => {
            expect(screen.getByText('Overall Score:')).toBeInTheDocument();
            expect(screen.getByText('Color Contrast Issues')).toBeInTheDocument();
            expect(screen.getByText('Form Accessibility Issues')).toBeInTheDocument();
            expect(screen.getByText('Touch Target Issues')).toBeInTheDocument();
        });
    });

    it('shows loading state during audit', async () => {
        const user = userEvent.setup();

        render(
            <AccessibilityProvider>
                <AccessibilityAudit />
            </AccessibilityProvider>
        );

        const auditButton = screen.getByText('Run Accessibility Audit');
        await user.click(auditButton);

        expect(screen.getByText('Running Audit...')).toBeInTheDocument();
    });

    it('announces audit completion to screen readers', async () => {
        const user = userEvent.setup();

        render(
            <AccessibilityProvider>
                <AccessibilityAudit />
            </AccessibilityProvider>
        );

        const auditButton = screen.getByText('Run Accessibility Audit');
        await user.click(auditButton);

        await waitFor(() => {
            expect(mockAnnounceToScreenReader).toHaveBeenCalledWith(
                expect.stringContaining('Accessibility audit complete'),
                'polite'
            );
        });
    });

    it('calls onAuditComplete callback when provided', async () => {
        const user = userEvent.setup();
        const mockOnAuditComplete = vi.fn();

        render(
            <AccessibilityProvider>
                <AccessibilityAudit onAuditComplete={mockOnAuditComplete} />
            </AccessibilityProvider>
        );

        const auditButton = screen.getByText('Run Accessibility Audit');
        await user.click(auditButton);

        await waitFor(() => {
            expect(mockOnAuditComplete).toHaveBeenCalledWith(
                expect.objectContaining({
                    timestamp: expect.any(String),
                    contrast: expect.any(Array),
                    forms: expect.any(Array),
                    touchTargets: expect.any(Array),
                    overall: expect.any(Object)
                })
            );
        });
    });

    it('displays correct overall score calculation', async () => {
        const user = userEvent.setup();

        // Mock perfect scores
        mockCalculateContrastRatio.mockReturnValue(5.0);
        mockValidateFormAccessibility.mockReturnValue({
            valid: true,
            issues: []
        });
        mockValidateTouchTargets.mockReturnValue({
            valid: true,
            issues: []
        });

        render(
            <AccessibilityProvider>
                <AccessibilityAudit />
            </AccessibilityProvider>
        );

        const auditButton = screen.getByText('Run Accessibility Audit');
        await user.click(auditButton);

        await waitFor(() => {
            expect(screen.getByText('Overall Score: 100%')).toBeInTheDocument();
        });
    });

    it('handles audit errors gracefully', async () => {
        const user = userEvent.setup();

        // Mock an error in contrast calculation
        mockCalculateContrastRatio.mockImplementation(() => {
            throw new Error('Contrast calculation failed');
        });

        render(
            <AccessibilityProvider>
                <AccessibilityAudit />
            </AccessibilityProvider>
        );

        const auditButton = screen.getByText('Run Accessibility Audit');
        await user.click(auditButton);

        // Should still complete and show results
        await waitFor(() => {
            expect(screen.getByText('Overall Score:')).toBeInTheDocument();
        });
    });
});