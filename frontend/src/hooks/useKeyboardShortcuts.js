/**
 * useKeyboardShortcuts Hook
 * Issue #422: Implement Global Keyboard Shortcuts System
 * 
 * A custom hook for registering and managing keyboard shortcuts.
 * Supports single keys, key sequences, and modifier combinations.
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * useKeyboardShortcuts
 * 
 * @param {Object} shortcuts - Map of shortcut keys to handler functions
 * @param {Object} options - Configuration options
 * @param {boolean} [options.enabled=true] - Whether shortcuts are enabled
 * @param {boolean} [options.preventDefault=false] - Prevent default browser behavior
 * @param {Array} [options.excludeInputs=true] - Exclude shortcuts when input is focused
 */
const useKeyboardShortcuts = (shortcuts, options = {}) => {
    const {
        enabled = true,
        preventDefault = false,
        excludeInputs = true
    } = options;

    const sequenceRef = useRef([]);
    const sequenceTimerRef = useRef(null);

    const isInputFocused = useCallback(() => {
        if (!excludeInputs) return false;

        const activeElement = document.activeElement;
        const tagName = activeElement?.tagName.toLowerCase();

        return (
            tagName === 'input' ||
            tagName === 'textarea' ||
            tagName === 'select' ||
            activeElement?.isContentEditable
        );
    }, [excludeInputs]);

    const handleKeyDown = useCallback((event) => {
        if (!enabled || isInputFocused()) return;

        const key = event.key;

        // Check for single key shortcuts
        Object.entries(shortcuts).forEach(([shortcutKey, handler]) => {
            const config = shortcutKey.split('+');

            // Handle modifier + key combinations
            if (config.length > 1) {
                const modifiers = config.slice(0, -1);
                const mainKey = config[config.length - 1];

                const hasRequiredModifiers = modifiers.every(mod => {
                    if (mod === 'ctrl') return event.ctrlKey;
                    if (mod === 'alt') return event.altKey;
                    if (mod === 'shift') return event.shiftKey;
                    if (mod === 'meta') return event.metaKey;
                    return false;
                });

                if (hasRequiredModifiers && key.toLowerCase() === mainKey.toLowerCase()) {
                    if (preventDefault) event.preventDefault();
                    handler(event);
                    return;
                }
            }

            // Handle single key shortcuts
            if (config.length === 1 && key.toLowerCase() === shortcutKey.toLowerCase()) {
                if (preventDefault) event.preventDefault();
                handler(event);
                return;
            }
        });

        // Handle key sequences (e.g., 'g' then 'h')
        sequenceRef.current.push(key.toLowerCase());

        // Clear sequence after 1 second of inactivity
        if (sequenceTimerRef.current) {
            clearTimeout(sequenceTimerRef.current);
        }

        sequenceTimerRef.current = setTimeout(() => {
            sequenceRef.current = [];
        }, 1000);

        // Check if sequence matches any shortcut
        const sequence = sequenceRef.current.join(' ');
        Object.entries(shortcuts).forEach(([shortcutKey, handler]) => {
            if (shortcutKey.includes(' ') && sequence === shortcutKey.toLowerCase()) {
                if (preventDefault) event.preventDefault();
                handler(event);
                sequenceRef.current = [];
                clearTimeout(sequenceTimerRef.current);
            }
        });
    }, [enabled, shortcuts, preventDefault, isInputFocused]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (sequenceTimerRef.current) {
                clearTimeout(sequenceTimerRef.current);
            }
        };
    }, [enabled, handleKeyDown]);

    return {
        enabled
    };
};

export default useKeyboardShortcuts;

/**
 * Example Usage:
 * 
 * const shortcuts = {
 *   'g h': () => navigate('/'),           // Sequence: g then h
 *   'ctrl+k': () => openSearch(),         // Modifier + key
 *   'l': () => likePost(),                // Single key
 *   '?': () => showHelp()                 // Special character
 * };
 * 
 * useKeyboardShortcuts(shortcuts, {
 *   enabled: true,
 *   preventDefault: true,
 *   excludeInputs: true
 * });
 */
