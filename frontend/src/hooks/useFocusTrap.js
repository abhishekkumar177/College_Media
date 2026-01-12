/**
 * useFocusTrap Hook
 * Issue #391: Implement useFocusTrap Hook for Modal Accessibility
 * 
 * A custom hook to trap keyboard focus within a modal dialog,
 * ensuring WCAG 2.1 compliance for accessible modal interactions.
 */

import { useEffect, useRef } from 'react';

/**
 * useFocusTrap
 * 
 * @param {boolean} isOpen - Whether the modal is currently open
 * @param {Function} onClose - Callback function to close the modal
 * @returns {Object} { modalRef } - Ref to attach to the modal container
 */
const useFocusTrap = (isOpen, onClose) => {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        // Store the element that had focus before modal opened
        previousActiveElement.current = document.activeElement;

        const modalElement = modalRef.current;
        if (!modalElement) return;

        // Get all focusable elements within the modal
        const getFocusableElements = () => {
            const focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'textarea:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                '[tabindex]:not([tabindex="-1"])'
            ].join(', ');

            return Array.from(modalElement.querySelectorAll(focusableSelectors));
        };

        // Focus the first focusable element when modal opens
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        // Handle Tab key to trap focus
        const handleKeyDown = (e) => {
            // Handle Escape key
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            // Handle Tab key
            if (e.key === 'Tab') {
                const focusableElements = getFocusableElements();

                if (focusableElements.length === 0) {
                    e.preventDefault();
                    return;
                }

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                // Shift + Tab (backwards)
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                }
                // Tab (forwards)
                else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        // Add event listener
        modalElement.addEventListener('keydown', handleKeyDown);

        // Set aria-hidden on other content (optional but recommended)
        const rootElement = document.getElementById('root');
        if (rootElement) {
            const children = Array.from(rootElement.children);
            children.forEach(child => {
                if (child !== modalElement && !modalElement.contains(child)) {
                    child.setAttribute('aria-hidden', 'true');
                }
            });
        }

        // Cleanup
        return () => {
            modalElement.removeEventListener('keydown', handleKeyDown);

            // Restore focus to the element that had it before modal opened
            if (previousActiveElement.current && previousActiveElement.current.focus) {
                previousActiveElement.current.focus();
            }

            // Remove aria-hidden from other content
            if (rootElement) {
                const children = Array.from(rootElement.children);
                children.forEach(child => {
                    child.removeAttribute('aria-hidden');
                });
            }
        };
    }, [isOpen, onClose]);

    return { modalRef };
};

export default useFocusTrap;
